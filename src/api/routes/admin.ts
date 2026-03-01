import express from 'express';
import { PrismaClient } from '@prisma/client';
import { error_logger } from '../../services/error_logger';

const router = express.Router();
const prisma = new PrismaClient();

// Middleware для перевірки адміна
const auth_admin = (req: any, res: any, next: any) => {
  const admin_token = req.headers.authorization?.split(' ')[1];
  const valid_token = process.env.ADMIN_TOKEN || 'admin_secret_token';

  if (admin_token !== valid_token) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
};

// 📊 Основна статистика системи
router.get('/stats', auth_admin, async (req, res) => {
  try {
    const users_count = await prisma.user.count();
    const active_users = await prisma.user.count({
      where: { status: 'ACTIVE' },
    });
    const scouts = await prisma.user.count({
      where: { role: 'SCOUT' },
    });
    const clients = await prisma.user.count({
      where: { role: 'CLIENT' },
    });

    const total_quests = await prisma.quest.count();
    const completed_quests = await prisma.quest.count({
      where: { status: 'COMPLETED' },
    });

    const task_orders = 0;
    const approved_orders = 0;

    const total_earned = await prisma.quest.aggregate({
      _sum: { reward: true },
      where: { status: 'COMPLETED' },
    });

    const reports = await prisma.report.count();
    const verified_reports = await prisma.report.count({
      where: { status: 'APPROVED' },
    });

    const stats = {
      users: {
        total: users_count,
        active: active_users,
        scouts,
        clients,
      },
      quests: {
        total: total_quests,
        completed: completed_quests,
        completion_rate: total_quests > 0
          ? ((completed_quests / total_quests) * 100).toFixed(2)
          : 0,
      },
      task_orders: {
        total: task_orders,
        approved: approved_orders,
        approval_rate: task_orders > 0
          ? ((approved_orders / task_orders) * 100).toFixed(2)
          : 0,
      },
      finances: {
        total_earned: total_earned._sum.reward || 0,
        average_per_quest:
          completed_quests > 0
            ? ((total_earned._sum.reward || 0) / completed_quests).toFixed(2)
            : 0,
      },
      reports: {
        total: reports,
        verified: verified_reports,
        verification_rate: reports > 0
          ? ((verified_reports / reports) * 100).toFixed(2)
          : 0,
      },
      timestamp: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to fetch stats', error);
    res.status(500).json({ error: error.message });
  }
});

// 🐛 Отримати всі помилки
router.get('/errors', auth_admin, (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 50, 500);
    const errors = error_logger.get_all_logs(limit);

    res.json({
      total: errors.length,
      errors,
    });
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to fetch errors', error);
    res.status(500).json({ error: error.message });
  }
});

// 📈 Статистика помилок
router.get('/errors/stats', auth_admin, (req, res) => {
  try {
    const stats = error_logger.get_statistics();
    res.json(stats);
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to fetch error stats', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Позначити помилку як виріщену
router.post('/errors/:id/resolve', auth_admin, (req, res) => {
  try {
    const success = error_logger.mark_resolved(req.params.id);
    res.json({ success });
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to resolve error', error);
    res.status(500).json({ error: error.message });
  }
});

// 👥 Активні користувачі (реальний час)
router.get('/users/activity', auth_admin, async (req, res) => {
  try {
    const active_last_hour = await prisma.user.count({
      where: {
        updatedAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000),
        },
      },
    });

    const new_users_today = await prisma.user.count({
      where: {
        createdAt: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    });

    const users_by_role = await prisma.user.groupBy({
      by: ['role'],
      _count: true,
    });

    res.json({
      active_last_hour,
      new_users_today,
      by_role: users_by_role,
    });
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to fetch user activity', error);
    res.status(500).json({ error: error.message });
  }
});

// 🎯 Топ завдання
router.get('/quests/top', auth_admin, async (req, res) => {
  try {
    const top_quests = await prisma.quest.findMany({
      take: 10,
      orderBy: { reward: 'desc' },
      select: {
        id: true,
        title: true,
        reward: true,
        status: true,
        createdAt: true,
      },
    });

    res.json(top_quests);
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to fetch top quests', error);
    res.status(500).json({ error: error.message });
  }
});

// 📋 Замовлення, що потребують уваги
router.get('/task-orders/pending', auth_admin, async (req, res) => {
  try {
    // const pending_orders = await prisma.taskOrder.findMany({
    //   where: {
    //     status: { in: ['PENDING_MODERATION', 'REJECTED'] },
    //   },
    //   take: 20,
    //   orderBy: { createdAt: 'desc' },
    //   include: {
    //     requester: { select: { firstName: true, lastName: true, email: true } },
    //   },
    // });
    const pending_orders: any[] = [];

    res.json(pending_orders);
  } catch (error: any) {
    error_logger.log_error(
      'Admin API',
      'Failed to fetch pending orders',
      error
    );
    res.status(500).json({ error: error.message });
  }
});

// 🔔 Проблемні звіти
router.get('/reports/problematic', auth_admin, async (req, res) => {
  try {
    const problematic_reports = await prisma.report.findMany({
      where: {
        status: 'PENDING',
      },
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        author: { select: { firstName: true, lastName: true, email: true } },
      },
    });

    res.json(problematic_reports);
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to fetch reports', error);
    res.status(500).json({ error: error.message });
  }
});

// 📊 Графік активності за час
router.get('/activity/timeline', auth_admin, async (req, res) => {
  try {
    const days = 30;
    const timeline: Record<string, number> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);

      const next_date = new Date(date);
      next_date.setDate(next_date.getDate() + 1);

      const count = await prisma.quest.count({
        where: {
          createdAt: {
            gte: date,
            lt: next_date,
          },
        },
      });

      timeline[date.toISOString().split('T')[0]] = count;
    }

    res.json(timeline);
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to fetch timeline', error);
    res.status(500).json({ error: error.message });
  }
});

// 💰 Фінансовий звіт
router.get('/finance/report', auth_admin, async (req, res) => {
  try {
    const total_paid = await prisma.quest.aggregate({
      _sum: { reward: true },
      where: { status: 'COMPLETED' },
    });

    const pending_payment = await prisma.quest.aggregate({
      _sum: { reward: true },
      where: { status: { in: ['SUBMITTED', 'VERIFIED'] } },
    });

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const today_earnings = await prisma.quest.aggregate({
      _sum: { reward: true },
      where: {
        status: 'COMPLETED',
        createdAt: { gte: today },
      },
    });

    res.json({
      total_paid: total_paid._sum.reward || 0,
      pending_payment: pending_payment._sum.reward || 0,
      today_earnings: today_earnings._sum.reward || 0,
    });
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to fetch finance report', error);
    res.status(500).json({ error: error.message });
  }
});

// 📋 Отримати всі завдання клієнтів на модерацію
router.get('/task-orders/pending', auth_admin, async (req, res) => {
  try {
    const pending = await (prisma as any).taskOrder.findMany({
      where: { status: 'PENDING_MODERATION' },
      include: {
        requester: { select: { id: true, firstName: true, lastName: true, email: true, username: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json(pending);
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to fetch pending task orders', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ Затвердити завдання клієнта
router.post('/task-orders/:id/approve', auth_admin, async (req, res) => {
  try {
    const orderId = req.params.id;

    // Get the order
    const order = await (prisma as any).taskOrder.findUnique({
      where: { id: orderId }
    });

    if (!order) {
      return res.status(404).json({ error: 'Task order not found' });
    }

    // Create quest from task order
    const quest = await (prisma as any).quest.create({
      data: {
        title: order.title,
        description: order.description,
        type: 'WORK',
        status: 'OPEN',
        reward: Number(order.budget),
        city: order.city,
        district: order.district,
        location: order.location,
        taskOrderId: order.id
      }
    });

    // Update task order status
    const updatedOrder = await (prisma as any).taskOrder.update({
      where: { id: orderId },
      data: { status: 'PUBLISHED' }
    });

    console.log('[SYNC] TaskOrder approved and converted to Quest:', {
      taskOrderId: order.id,
      questId: quest.id,
      title: quest.title
    });

    res.json({ 
      message: 'Task order approved and published as quest',
      quest,
      taskOrder: updatedOrder
    });
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to approve task order', error);
    res.status(500).json({ error: error.message });
  }
});

// ❌ Відхилити завдання клієнта
router.post('/task-orders/:id/reject', auth_admin, async (req, res) => {
  try {
    const orderId = req.params.id;
    const { reason } = req.body || {};

    const order = await (prisma as any).taskOrder.update({
      where: { id: orderId },
      data: { status: 'REJECTED' }
    });

    console.log('[SYNC] TaskOrder rejected:', { orderId, reason });

    res.json({ message: 'Task order rejected', order });
  } catch (error: any) {
    error_logger.log_error('Admin API', 'Failed to reject task order', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
