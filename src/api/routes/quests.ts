import { Router } from 'express';
import prisma from '../../services/prisma';
import { authenticateToken } from '../middleware/auth';
import { awardDignity } from '../../services/reputation';
import { recordActivity } from '../../services/life_recorder';
import { completionUpload } from '../middleware/upload';
import { getQuestVerifiers, notifyCompletionSubmitted } from '../../services/task_completion';
import { notifyQuestCreated, notifyQuestCompleted } from '../../services/questNotifications';

const router = Router();

// List available quests
router.get('/available', authenticateToken, async (req: any, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        const showAll = req.query?.all === 'true' || user?.role === 'ADMIN';
        const userCity = user?.city?.trim();
        const userDistrict = user?.district?.trim();

        const where: any = { status: 'OPEN' };
        if (!showAll) {
            where.OR = [
                {
                    isPersonal: false,
                    city: userCity || undefined,
                    district: userDistrict || undefined
                },
                {
                    isPersonal: false,
                    city: userCity || undefined
                },
                {
                    isPersonal: false,
                    district: userDistrict || undefined
                },
                {
                    isPersonal: true,
                    assignedToChild: req.user.userId
                }
            ];
        }

        let quests = await (prisma as any).quest.findMany({
            where,
            take: 10,
            orderBy: { createdAt: 'desc' }
        });

        // Fallback: if geo filters returned nothing, show latest open non-personal quests
        if (!showAll && quests.length === 0) {
            quests = await (prisma as any).quest.findMany({
                where: {
                    status: 'OPEN',
                    isPersonal: false
                },
                take: 10,
                orderBy: { createdAt: 'desc' }
            });
        }

        res.json(quests);
    } catch (error) {
        next(error);
    }
});

// Take a quest
router.post('/:id/take', authenticateToken, async (req: any, res, next) => {
    try {
        const questId = req.params.id;
        const userId = req.user.userId;

        const currentQuest = await (prisma as any).quest.findUnique({ where: { id: questId } });
        if (!currentQuest) {
            return res.status(404).json({ error: 'Quest not found' });
        }

        if (currentQuest.isPersonal && currentQuest.assignedToChild && currentQuest.assignedToChild !== userId) {
            return res.status(403).json({ error: 'This personal quest is assigned to another child' });
        }

        if (currentQuest.status !== 'OPEN') {
            return res.status(400).json({ error: 'Quest not available' });
        }

        const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

        const quest = await (prisma as any).quest.update({
            where: { id: questId },
            data: {
                status: 'IN_PROGRESS',
                assigneeId: userId,
                pickupCode,
                deliveryCode
            }
        });

        await recordActivity(userId, 'QUEST_STARTED', { questId, title: quest.title });
        
        // Send push notification about new quest
        notifyQuestCreated(questId).catch(e => console.error('[PUSH] Failed to notify quest created:', e));

        res.json({ quest, pickupCode, deliveryCode });
    } catch (error) {
        res.status(400).json({ error: 'Quest not available' });
    }
});

// Complete a quest
router.post('/:id/complete', authenticateToken, completionUpload.single('photo'), async (req: any, res, next) => {
    try {
        console.log('[QUEST COMPLETE] Request received');
        console.log('[QUEST COMPLETE] Body:', req.body);
        console.log('[QUEST COMPLETE] File:', req.file ? {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        } : 'No file');
        
        const questId = req.params.id;
        const { code, latitude, longitude } = req.body;
        const userId = req.user.userId;

        const quest = await (prisma as any).quest.findUnique({
            where: { id: questId },
            include: {
                taskOrder: {
                    select: { requesterId: true }
                }
            }
        });

        if (!quest || quest.assigneeId !== userId || quest.status !== 'IN_PROGRESS') {
            console.log('[QUEST COMPLETE] Invalid quest state:', {
                exists: !!quest,
                assigneeId: quest?.assigneeId,
                userId,
                status: quest?.status
            });
            return res.status(400).json({ error: 'Invalid quest state' });
        }

        if (code !== quest.deliveryCode) {
            console.log('[QUEST COMPLETE] Invalid delivery code:', { provided: code, expected: quest.deliveryCode });
            return res.status(400).json({ error: 'Invalid delivery code' });
        }

        // Перевірка наявності локації
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Location is required to complete quest' });
        }

        const photoFile = req.file as Express.Multer.File | undefined;
        const photoUrl = photoFile ? `/uploads/completions/${photoFile.filename}` : (req.body?.photoUrl || null);
        const photoTelegramId = req.body?.photoTelegramId || null;
        const description = req.body?.description || null;

        const verifiers = await getQuestVerifiers(quest);
        const mustBeVerified = Boolean(quest.taskOrderId || quest.isPersonal) && !quest.autoApprove;

        if (mustBeVerified && verifiers.length > 0) {
            const completion = await (prisma as any).taskCompletion.create({
                data: {
                    questId,
                    studentId: userId,
                    photoUrl,
                    photoTelegramId,
                    description,
                    latitude: Number(latitude),
                    longitude: Number(longitude),
                    status: 'PENDING'
                }
            });

            await (prisma as any).quest.update({
                where: { id: questId },
                data: {
                    status: 'PENDING_VERIFICATION',
                    completionLatitude: Number(latitude),
                    completionLongitude: Number(longitude)
                }
            });

            const student = await prisma.user.findUnique({
                where: { id: userId },
                select: { firstName: true, lastName: true }
            });

            await notifyCompletionSubmitted({
                completionId: completion.id,
                questTitle: quest.title,
                reward: Number(quest.reward),
                studentName: `${student?.firstName || ''} ${student?.lastName || ''}`.trim() || 'Студент',
                photoUrl,
                verifiers
            });

            await recordActivity(userId, 'QUEST_SUBMITTED_FOR_VERIFICATION', {
                questId,
                completionId: completion.id,
                location: { latitude, longitude }
            });
            
            // Send push notification about quest completion
            notifyQuestCompleted(questId).catch(e => console.error('[PUSH] Failed to notify quest completed:', e));

            return res.json({
                message: 'Завдання надіслано на перевірку. Винагорода буде нарахована після підтвердження.',
                status: 'PENDING_VERIFICATION',
                completionId: completion.id
            });
        }

        await (prisma as any).quest.update({
            where: { id: questId },
            data: {
                status: 'COMPLETED',
                completionLatitude: Number(latitude),
                completionLongitude: Number(longitude)
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: Number(quest.reward) } }
        });

        await (prisma as any).taskCompletion.create({
            data: {
                questId,
                studentId: userId,
                photoUrl,
                photoTelegramId,
                description,
                latitude: Number(latitude),
                longitude: Number(longitude),
                status: 'APPROVED',
                rewardAmount: Number(quest.reward),
                rewardPaid: true,
                verifiedById: userId,
                verifiedAt: new Date()
            }
        });

        await awardDignity(userId, 5);
        await recordActivity(userId, 'QUEST_COMPLETED', {
            questId,
            location: { latitude, longitude }
        });

        res.json({ message: 'Quest completed successfully', reward: quest.reward, status: 'COMPLETED' });
    } catch (error) {
        next(error);
    }
});

export default router;
