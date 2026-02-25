import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user stats (for dashboard)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { firstName: true, lastName: true, dignityScore: true, balance: true }
    });

    const completedQuests = await prisma.quest.count({
      where: {
        createdAt: { lte: new Date() }  // Count all quests as placeholder
      }
    });

    const incompleteQuests = await prisma.quest.count({
      where: {
        createdAt: { lte: new Date() }
      }
    });

    res.json({
      name: `${user?.firstName} ${user?.lastName}`.trim(),
      completedQuests,
      incompleteQuests,
      totalEarned: user?.balance || 0,
      integrity: user?.dignityScore || 0
    });
  } catch (error: any) {
    console.error('Error getting user stats:', error);
    res.status(500).json({ error: error.message });
  }
});


// Get user's active quest
router.get('/active-quest', authenticateToken, async (req: any, res, next) => {
    try {
        const userId = req.user.userId;
        const activeQuest = await prisma.quest.findFirst({
            where: {
                assigneeId: userId,
                status: 'IN_PROGRESS'
            }
        });
        res.json(activeQuest || null);
    } catch (error) {
        next(error);
    }
});

export default router;
