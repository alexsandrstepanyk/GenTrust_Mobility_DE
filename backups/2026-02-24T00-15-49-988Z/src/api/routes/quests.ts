import { Router } from 'express';
import prisma from '../../services/prisma';
import { authenticateToken } from '../middleware/auth';
import { awardDignity } from '../../services/reputation';
import { recordActivity } from '../../services/life_recorder';

const router = Router();

// List available quests
router.get('/available', authenticateToken, async (req: any, res, next) => {
    try {
        const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
        const showAll = req.query?.all === 'true' || user?.role === 'ADMIN';
        const where: any = { status: 'OPEN' };
        if (!showAll) {
            if (user?.city) where.city = user.city;
            if (user?.district) where.district = user.district;
        }

        const quests = await (prisma as any).quest.findMany({
            where,
            take: 10,
            orderBy: { createdAt: 'desc' }
        });
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

        const pickupCode = Math.floor(1000 + Math.random() * 9000).toString();
        const deliveryCode = Math.floor(1000 + Math.random() * 9000).toString();

        const quest = await (prisma as any).quest.update({
            where: { id: questId, status: 'OPEN' },
            data: {
                status: 'IN_PROGRESS',
                assigneeId: userId,
                pickupCode,
                deliveryCode
            }
        });

        await recordActivity(userId, 'QUEST_STARTED', { questId, title: quest.title });

        res.json({ quest, pickupCode, deliveryCode });
    } catch (error) {
        res.status(400).json({ error: 'Quest not available' });
    }
});

// Complete a quest
router.post('/:id/complete', authenticateToken, async (req: any, res, next) => {
    try {
        const questId = req.params.id;
        const { code, latitude, longitude } = req.body;
        const userId = req.user.userId;

        const quest = await (prisma as any).quest.findUnique({ where: { id: questId } });

        if (!quest || quest.assigneeId !== userId || quest.status !== 'IN_PROGRESS') {
            return res.status(400).json({ error: 'Invalid quest state' });
        }

        if (code !== quest.deliveryCode) {
            return res.status(400).json({ error: 'Invalid delivery code' });
        }

        // Перевірка наявності локації
        if (!latitude || !longitude) {
            return res.status(400).json({ error: 'Location is required to complete quest' });
        }

        await (prisma as any).quest.update({
            where: { id: questId },
            data: { 
                status: 'COMPLETED',
                completionLatitude: latitude,
                completionLongitude: longitude,
            }
        });

        await prisma.user.update({
            where: { id: userId },
            data: { balance: { increment: quest.reward } }
        });

        await awardDignity(userId, 5);
        await recordActivity(userId, 'QUEST_COMPLETED', { 
            questId, 
            location: { latitude, longitude } 
        });

        res.json({ message: 'Quest completed successfully', reward: quest.reward });
    } catch (error) {
        next(error);
    }
});

export default router;
