import { Router } from 'express';
import prisma from '../../services/prisma';
import { authenticateToken } from '../middleware/auth';
import { awardDignity } from '../../services/reputation';
import { recordActivity } from '../../services/life_recorder';
import { canUserVerifyCompletion, notifyCompletionApproved, notifyCompletionRejected } from '../../services/task_completion';
import { notifyQuestVerified } from '../../services/questNotifications';

const router = Router();

router.get('/pending', authenticateToken, async (req: any, res, next) => {
    try {
        const userId = req.user.userId as string;

        const completions = await (prisma as any).taskCompletion.findMany({
            where: { status: 'PENDING' },
            include: {
                student: { select: { id: true, firstName: true, lastName: true, telegramId: true } },
                quest: {
                    include: {
                        taskOrder: { select: { requesterId: true } }
                    }
                }
            },
            orderBy: { completedAt: 'desc' }
        });

        const allowed: any[] = [];
        for (const completion of completions) {
            const canVerify = await canUserVerifyCompletion(userId, completion);
            if (canVerify) allowed.push(completion);
        }

        res.json(allowed);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authenticateToken, async (req: any, res, next) => {
    try {
        const completion = await (prisma as any).taskCompletion.findUnique({
            where: { id: req.params.id },
            include: {
                student: { select: { id: true, firstName: true, lastName: true } },
                verifiedBy: { select: { id: true, firstName: true, lastName: true } },
                quest: {
                    include: {
                        taskOrder: { select: { requesterId: true } }
                    }
                }
            }
        });

        if (!completion) {
            return res.status(404).json({ error: 'Completion not found' });
        }

        const canVerify = await canUserVerifyCompletion(req.user.userId, completion);
        if (!canVerify && completion.studentId !== req.user.userId && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden' });
        }

        res.json(completion);
    } catch (error) {
        next(error);
    }
});

router.post('/:id/approve', authenticateToken, async (req: any, res, next) => {
    try {
        const completionId = req.params.id;
        const verifierId = req.user.userId as string;

        const completion = await (prisma as any).taskCompletion.findUnique({
            where: { id: completionId },
            include: {
                student: { select: { id: true, telegramId: true } },
                quest: {
                    include: { taskOrder: { select: { requesterId: true } } }
                }
            }
        });

        if (!completion) {
            return res.status(404).json({ error: 'Completion not found' });
        }

        if (completion.status !== 'PENDING') {
            return res.status(400).json({ error: 'Completion already processed' });
        }

        const canVerify = await canUserVerifyCompletion(verifierId, completion);
        if (!canVerify && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You cannot verify this completion' });
        }

        const reward = Number(completion.quest.reward || 0);

        await (prisma as any).$transaction(async (tx: any) => {
            await tx.taskCompletion.update({
                where: { id: completionId },
                data: {
                    status: 'APPROVED',
                    verifiedById: verifierId,
                    verifiedAt: new Date(),
                    rewardAmount: reward,
                    rewardPaid: true
                }
            });

            await tx.user.update({
                where: { id: completion.studentId },
                data: { balance: { increment: reward } }
            });

            await tx.quest.update({
                where: { id: completion.questId },
                data: { status: 'COMPLETED' }
            });
        });

        await awardDignity(completion.studentId, 5);
        await recordActivity(completion.studentId, 'QUEST_REWARD_APPROVED', {
            completionId,
            questId: completion.questId,
            reward
        });

        await notifyCompletionApproved({
            studentId: completion.studentId,
            studentTelegramId: completion.student?.telegramId,
            questTitle: completion.quest.title,
            reward
        });
        
        // Send push notification about quest verification
        notifyQuestVerified(completion.questId, true).catch(e => console.error('[PUSH] Failed to notify quest verified:', e));

        res.json({
            message: 'Completion approved. Reward credited.',
            reward
        });
    } catch (error) {
        next(error);
    }
});

router.post('/:id/reject', authenticateToken, async (req: any, res, next) => {
    try {
        const completionId = req.params.id;
        const verifierId = req.user.userId as string;
        const reason = (req.body?.reason || '').toString().trim() || 'Потрібне доопрацювання';

        const completion = await (prisma as any).taskCompletion.findUnique({
            where: { id: completionId },
            include: {
                student: { select: { id: true, telegramId: true } },
                quest: {
                    include: { taskOrder: { select: { requesterId: true } } }
                }
            }
        });

        if (!completion) {
            return res.status(404).json({ error: 'Completion not found' });
        }

        if (completion.status !== 'PENDING') {
            return res.status(400).json({ error: 'Completion already processed' });
        }

        const canVerify = await canUserVerifyCompletion(verifierId, completion);
        if (!canVerify && req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'You cannot verify this completion' });
        }

        await (prisma as any).$transaction(async (tx: any) => {
            await tx.taskCompletion.update({
                where: { id: completionId },
                data: {
                    status: 'REJECTED',
                    verifiedById: verifierId,
                    verifiedAt: new Date(),
                    rejectionReason: reason,
                    rewardPaid: false
                }
            });

            await tx.quest.update({
                where: { id: completion.questId },
                data: { status: 'IN_PROGRESS' }
            });
        });

        await recordActivity(completion.studentId, 'QUEST_REJECTED_BY_REVIEW', {
            completionId,
            questId: completion.questId,
            reason
        });

        await notifyCompletionRejected({
            studentId: completion.studentId,
            studentTelegramId: completion.student?.telegramId,
            questTitle: completion.quest.title,
            reason
        });
        
        // Send push notification about quest rejection
        notifyQuestVerified(completion.questId, false).catch(e => console.error('[PUSH] Failed to notify quest rejected:', e));

        res.json({ message: 'Completion rejected', reason });
    } catch (error) {
        next(error);
    }
});

export default router;
