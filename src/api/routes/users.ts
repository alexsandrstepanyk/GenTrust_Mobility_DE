import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get user stats (for dashboard)
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.userId;

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

// Register or update Expo push token for current user
router.post('/push-token', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const token = (req.body?.token || '').toString().trim();

    if (!token) {
      return res.status(400).json({ error: 'Push token is required' });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { pushToken: token }
    });

    res.json({ message: 'Push token saved' });
  } catch (error: any) {
    console.error('Error saving push token:', error);
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

// Get current user profile
router.get('/me', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        dignityScore: true,
        balance: true,
        phone: true,
        address: true,
        birthDate: true,
        school: true,
        grade: true,
        language: true,
        pushToken: true,
      }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if GPS sharing is enabled
    const parentRelation = await prisma.parentChild.findFirst({
      where: { childId: userId },
      select: { canTrackGPS: true }
    });

    res.json({
      ...user,
      phone: user.phone || '',
      address: user.address || '',
      gpsSharing: parentRelation?.canTrackGPS !== false
    });
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update current user profile
router.patch('/me', authenticateToken, async (req: any, res) => {
  try {
    const userId = req.user.userId;
    const { phone, address, birthDate, school, grade, gpsSharing } = req.body;

    // Update user data
    const updateData: any = {};
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (birthDate !== undefined) updateData.birthDate = birthDate;
    if (school !== undefined) updateData.school = school;
    if (grade !== undefined) updateData.grade = grade;

    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Update GPS sharing if provided
    if (gpsSharing !== undefined) {
      await prisma.parentChild.updateMany({
        where: { childId: userId },
        data: { canTrackGPS: gpsSharing }
      });
    }

    res.json({ message: 'Profile updated successfully' });
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
