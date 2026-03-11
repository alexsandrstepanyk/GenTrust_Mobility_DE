import { Router } from 'express';
import prisma from '../../services/prisma';
import { authenticateToken } from '../middleware/auth';

const router = Router();

// Dashboard stats endpoint (public - for dashboards)
router.get('/dashboard', async (req, res, next) => {
  try {
    // Get reports stats
    const totalReports = await prisma.report.count();
    const pendingReports = await prisma.report.count({
      where: { status: 'PENDING' }
    });
    const approvedReports = await prisma.report.count({
      where: { status: 'APPROVED' }
    });
    const inProgressReports = await prisma.report.count({
      where: { status: 'IN_PROGRESS' }
    });

    // Get reports by category
    const reportsByCategory = await prisma.report.groupBy({
      by: ['category'],
      _count: true,
      orderBy: { _count: { category: 'desc' } }
    });

    // Get reports by day for last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const reportsByDay = await prisma.report.findMany({
      where: {
        createdAt: { gte: thirtyDaysAgo }
      },
      select: { createdAt: true }
    });

    // Group by day
    const dailyReports: Record<string, number> = {};
    reportsByDay.forEach(report => {
      const date = new Date(report.createdAt).toISOString().split('T')[0];
      dailyReports[date] = (dailyReports[date] || 0) + 1;
    });

    const dailyReportsArray = Object.entries(dailyReports)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, count]) => ({ date, count }));

    // Get users stats
    const totalUsers = await prisma.user.count();
    const activeUsers = await prisma.user.count({
      where: { status: 'ACTIVE' }
    });
    const pendingUsers = await prisma.user.count({
      where: { status: 'PENDING' }
    });

    // Get quests stats
    const totalQuests = await prisma.quest.count();
    const openQuests = await prisma.quest.count({
      where: { status: 'OPEN' }
    });
    const completedQuests = await prisma.quest.count({
      where: { status: 'COMPLETED' }
    });

    const stats = {
      reports: {
        total: totalReports,
        pending: pendingReports,
        inProgress: inProgressReports,
        approved: approvedReports,
        byCategory: reportsByCategory.map(cat => ({
          category: cat.category || 'Інше',
          count: cat._count
        })),
        dailyReports: dailyReportsArray
      },
      users: {
        total: totalUsers,
        active: activeUsers,
        pending: pendingUsers
      },
      quests: {
        total: totalQuests,
        open: openQuests,
        completed: completedQuests
      },
      timestamp: new Date()
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    next(error);
  }
});

// Reports stats endpoint (optional - for time period filtering)
router.get('/reports', async (req, res, next) => {
  try {
    const { period = '30' } = req.query;
    const days = parseInt(period as string) || 30;

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const reports = await prisma.report.findMany({
      where: { createdAt: { gte: startDate } },
      include: {
        author: { select: { username: true, firstName: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(reports);
  } catch (error) {
    console.error('Reports stats error:', error);
    next(error);
  }
});

export default router;
