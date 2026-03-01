import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// City Hall Dashboard: list users for moderation/management
router.get('/', async (req, res) => {
  try {
    const { status, role, limit = '200' } = req.query as any;

    const where: any = {};
    if (status) where.status = status;
    if (role) where.role = role;

    const users = await prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: Number(limit) || 200,
      include: {
        reports: { select: { id: true } },
        completedTasks: { select: { id: true } }
      }
    });

    const transformed = users.map((u) => ({
      id: u.id,
      name: `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.username || 'Користувач',
      email: u.email || '',
      phone: u.phone || '',
      role: (u.role === 'CLIENT' ? 'STUDENT' : u.role) as string,
      status: u.status as string,
      createdAt: u.createdAt,
      stats: {
        reportsSubmitted: u.reports?.length || 0,
        questsCompleted: u.completedTasks?.length || 0
      }
    }));

    res.json(transformed);
  } catch (error: any) {
    console.error('Error listing users:', error);
    res.status(500).json({ error: error.message });
  }
});

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

// City Hall Dashboard: get user details by id
router.get('/:id', async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.params.id } });
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json(user);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// City Hall Dashboard: approve registration request
router.post('/:id/approve', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'ACTIVE' }
    });

    const io = (global as any).io;
    if (io) {
      io.to('users').emit('user:updated', { id: user.id, status: 'ACTIVE' });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// City Hall Dashboard: reject registration request
router.post('/:id/reject', async (req, res) => {
  try {
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { status: 'REJECTED' }
    });

    const io = (global as any).io;
    if (io) {
      io.to('users').emit('user:updated', { id: user.id, status: 'REJECTED' });
    }

    res.json({ success: true, user });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
