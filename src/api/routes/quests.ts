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
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[QUEST COMPLETE] Request received');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[QUEST COMPLETE] Quest ID:', req.params.id);
        console.log('[QUEST COMPLETE] User ID:', req.user.userId);
        console.log('[QUEST COMPLETE] Body:', JSON.stringify(req.body, null, 2));
        console.log('[QUEST COMPLETE] File:', req.file ? {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype,
            path: req.file.path
        } : '❌ No file uploaded');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const questId = req.params.id;
        const { code, latitude, longitude } = req.body;
        const userId = req.user.userId;

        // Step 1: Validate quest exists
        console.log('[QUEST COMPLETE] Step 1: Loading quest from database...');
        const quest = await (prisma as any).quest.findUnique({
            where: { id: questId },
            include: {
                taskOrder: {
                    select: { requesterId: true }
                }
            }
        });

        if (!quest) {
            console.error('[QUEST COMPLETE] ❌ Quest not found:', questId);
            return res.status(404).json({ error: 'Quest not found' });
        }
        console.log('[QUEST COMPLETE] ✅ Quest found:', { title: quest.title, status: quest.status, assigneeId: quest.assigneeId });

        // Step 2: Validate ownership
        console.log('[QUEST COMPLETE] Step 2: Validating quest ownership...');
        if (quest.assigneeId !== userId) {
            console.error('[QUEST COMPLETE] ❌ Quest not assigned to this user. Expected:', quest.assigneeId, 'Got:', userId);
            return res.status(400).json({ error: 'This quest is not assigned to you' });
        }

        // Idempotency checks
        if (quest.status === 'COMPLETED') {
            console.log('[QUEST COMPLETE] ✅ Idempotent complete: quest already COMPLETED');
            return res.json({ message: 'Quest already completed', reward: quest.reward, status: 'COMPLETED', idempotent: true });
        }

        if (quest.status === 'PENDING_VERIFICATION') {
            const existingPending = await (prisma as any).taskCompletion.findFirst({
                where: { questId, studentId: userId, status: 'PENDING' },
                orderBy: { createdAt: 'desc' }
            });

            console.log('[QUEST COMPLETE] ✅ Idempotent complete: quest already PENDING_VERIFICATION');
            return res.json({
                message: 'Завдання вже надіслано на перевірку.',
                status: 'PENDING_VERIFICATION',
                completionId: existingPending?.id || null,
                idempotent: true
            });
        }

        if (quest.status !== 'IN_PROGRESS') {
            console.error('[QUEST COMPLETE] ❌ Quest status is not IN_PROGRESS. Current:', quest.status);
            return res.status(400).json({ error: 'Quest is not in progress' });
        }
        console.log('[QUEST COMPLETE] ✅ Quest state valid');

        // Step 3: Validate delivery code
        console.log('[QUEST COMPLETE] Step 3: Validating delivery code...');
        if (code !== quest.deliveryCode) {
            console.error('[QUEST COMPLETE] ❌ Invalid delivery code. Expected:', quest.deliveryCode, 'Got:', code);
            return res.status(400).json({ error: 'Invalid delivery code' });
        }
        console.log('[QUEST COMPLETE] ✅ Delivery code valid');

        // Step 4: Validate location
        console.log('[QUEST COMPLETE] Step 4: Validating location...');
        if (!latitude || !longitude) {
            console.error('[QUEST COMPLETE] ❌ Location is required');
            return res.status(400).json({ error: 'Location is required to complete quest' });
        }
        console.log('[QUEST COMPLETE] ✅ Location valid:', { latitude, longitude });

        // Step 5: Process photo
        console.log('[QUEST COMPLETE] Step 5: Processing photo...');
        const photoFile = req.file as Express.Multer.File | undefined;
        const photoUrl = photoFile ? `/uploads/completions/${photoFile.filename}` : (req.body?.photoUrl || null);
        const photoTelegramId = req.body?.photoTelegramId || null;
        const description = req.body?.description || null;
        console.log('[QUEST COMPLETE] Photo URL:', photoUrl);

        const verifiers = await getQuestVerifiers(quest);
        const mustBeVerified = Boolean(quest.taskOrderId || quest.isPersonal) && !quest.autoApprove;

        console.log('[QUEST COMPLETE] Step 6: Checking verification requirements...');
        console.log('[QUEST COMPLETE] Task Order ID:', quest.taskOrderId);
        console.log('[QUEST COMPLETE] Is Personal:', quest.isPersonal);
        console.log('[QUEST COMPLETE] Auto Approve:', quest.autoApprove);
        console.log('[QUEST COMPLETE] Must Be Verified:', mustBeVerified);
        console.log('[QUEST COMPLETE] Verifiers:', verifiers);

        if (mustBeVerified && verifiers.length > 0) {
            console.log('[QUEST COMPLETE] Step 7a: Transaction for pending completion...');
            const completion = await prisma.$transaction(async (tx: any) => {
                const lockQuest = await tx.quest.findUnique({ where: { id: questId } });

                if (!lockQuest) {
                    throw new Error('Quest not found');
                }

                if (lockQuest.status === 'PENDING_VERIFICATION') {
                    const existing = await tx.taskCompletion.findFirst({
                        where: { questId, studentId: userId, status: 'PENDING' },
                        orderBy: { createdAt: 'desc' }
                    });
                    if (existing) {
                        return existing;
                    }
                }

                if (lockQuest.status !== 'IN_PROGRESS') {
                    throw new Error(`Quest cannot be completed from status ${lockQuest.status}`);
                }

                const updated = await tx.quest.updateMany({
                    where: {
                        id: questId,
                        status: 'IN_PROGRESS',
                        assigneeId: userId,
                        deliveryCode: code
                    },
                    data: {
                        status: 'PENDING_VERIFICATION',
                        completionLatitude: Number(latitude),
                        completionLongitude: Number(longitude)
                    }
                });

                if (updated.count === 0) {
                    const latest = await tx.quest.findUnique({ where: { id: questId } });
                    if (latest?.status === 'PENDING_VERIFICATION') {
                        const existing = await tx.taskCompletion.findFirst({
                            where: { questId, studentId: userId, status: 'PENDING' },
                            orderBy: { createdAt: 'desc' }
                        });
                        if (existing) {
                            return existing;
                        }
                    }
                    throw new Error('Quest completion state changed, retry request');
                }

                return tx.taskCompletion.create({
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
            });
            console.log('[QUEST COMPLETE] ✅ Completion created:', completion.id);

            console.log('[QUEST COMPLETE] Step 9a: Notifying verifiers...');
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
            console.log('[QUEST COMPLETE] ✅ Verifiers notified');

            await recordActivity(userId, 'QUEST_SUBMITTED_FOR_VERIFICATION', {
                questId,
                completionId: completion.id,
                location: { latitude, longitude }
            });

            const io = (global as any).io;
            if (io) {
                io.to('stats').emit('stats:update', {
                    scope: 'quests',
                    action: 'pending_verification',
                    questId,
                    timestamp: new Date().toISOString()
                });
            }

            // Send push notification about quest completion
            notifyQuestCompleted(questId).catch(e => console.error('[PUSH] Failed to notify quest completed:', e));

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('[QUEST COMPLETE] ✅✅✅ SUCCESS - PENDING_VERIFICATION');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            return res.json({
                message: 'Завдання надіслано на перевірку. Винагорода буде нарахована після підтвердження.',
                status: 'PENDING_VERIFICATION',
                completionId: completion.id
            });
        }

        console.log('[QUEST COMPLETE] Step 7b: Auto-approving quest transaction...');
        const autoResult = await prisma.$transaction(async (tx: any) => {
            const lockQuest = await tx.quest.findUnique({ where: { id: questId } });

            if (!lockQuest) {
                throw new Error('Quest not found');
            }

            if (lockQuest.status === 'COMPLETED') {
                return { alreadyCompleted: true };
            }

            if (lockQuest.status !== 'IN_PROGRESS') {
                throw new Error(`Quest cannot be completed from status ${lockQuest.status}`);
            }

            const updated = await tx.quest.updateMany({
                where: {
                    id: questId,
                    status: 'IN_PROGRESS',
                    assigneeId: userId,
                    deliveryCode: code
                },
                data: {
                    status: 'COMPLETED',
                    completionLatitude: Number(latitude),
                    completionLongitude: Number(longitude)
                }
            });

            if (updated.count === 0) {
                const latest = await tx.quest.findUnique({ where: { id: questId } });
                if (latest?.status === 'COMPLETED') {
                    return { alreadyCompleted: true };
                }
                throw new Error('Quest completion state changed, retry request');
            }

            await tx.user.update({
                where: { id: userId },
                data: { balance: { increment: Number(quest.reward) } }
            });

            const completion = await tx.taskCompletion.create({
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

            return { alreadyCompleted: false, completion };
        });

        if ((autoResult as any).alreadyCompleted) {
            return res.json({ message: 'Quest already completed', reward: quest.reward, status: 'COMPLETED', idempotent: true });
        }

        console.log('[QUEST COMPLETE] ✅ Quest COMPLETED, balance updated, completion created');

        console.log('[QUEST COMPLETE] Step 10b: Awarding dignity points...');
        await awardDignity(userId, 5);
        console.log('[QUEST COMPLETE] ✅ Dignity points awarded: +5');

        await recordActivity(userId, 'QUEST_COMPLETED', {
            questId,
            location: { latitude, longitude }
        });
        console.log('[QUEST COMPLETE] ✅ Activity recorded');

        const io = (global as any).io;
        if (io) {
            io.to('stats').emit('stats:update', {
                scope: 'quests',
                action: 'completed',
                questId,
                timestamp: new Date().toISOString()
            });
        }

        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('[QUEST COMPLETE] ✅✅✅ SUCCESS - COMPLETED');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        res.json({ message: 'Quest completed successfully', reward: quest.reward, status: 'COMPLETED' });
    } catch (error: any) {
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.error('[QUEST COMPLETE] ❌❌❌ ERROR');
        console.error('[QUEST COMPLETE] Error type:', error.constructor.name);
        console.error('[QUEST COMPLETE] Error message:', error.message);
        console.error('[QUEST COMPLETE] Stack:', error.stack);
        console.error('[QUEST COMPLETE] Body:', req.body);
        console.error('[QUEST COMPLETE] File:', req.file ? {
            filename: req.file.filename,
            size: req.file.size,
            mimetype: req.file.mimetype
        } : 'No file');
        console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        next(error);
    }
});

export default router;
