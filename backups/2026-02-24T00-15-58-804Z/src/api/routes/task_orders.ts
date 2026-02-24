import { Router } from 'express';
import prisma from '../../services/prisma';
import { authenticateToken } from '../middleware/auth';
import { messengerHub } from '../../services/messenger';

const router = Router();

router.post('/', authenticateToken, async (req: any, res, next) => {
    try {
        const userId = req.user.userId;
        const {
            title,
            description,
            subject,
            grade,
            budget,
            city,
            district,
            location
        } = req.body || {};

        if (!title || !budget) {
            return res.status(400).json({ error: 'Title and budget are required' });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (user.status !== 'ACTIVE') {
            return res.status(403).json({ error: 'Account pending moderation' });
        }

        const order = await (prisma as any).taskOrder.create({
            data: {
                title: String(title).trim(),
                description,
                subject,
                grade,
                budget: Number(budget),
                city,
                district,
                location,
                requesterId: userId,
                status: 'PENDING_MODERATION'
            }
        });

        const adminChatId = process.env.ADMIN_CHAT_ID;
        if (adminChatId) {
            const msg = `🆕 **Нове замовлення завдання**\n\n` +
                `📝 Назва: ${order.title}\n` +
                `💬 Опис: ${order.description || '—'}\n` +
                `📚 Предмет: ${order.subject || '—'}\n` +
                `🎓 Клас/Група: ${order.grade || '—'}\n` +
                `💰 Оплата: ${order.budget}\n` +
                `📍 Локація: ${order.city || '—'}, ${order.district || '—'} ${order.location ? `(${order.location})` : ''}\n` +
                `👤 Клієнт: ${user.firstName || user.username || user.email || user.id}`;

            await messengerHub.sendToMaster(Number(adminChatId), msg, {
                reply_markup: {
                    inline_keyboard: [
                        [{ text: '✅ Підтвердити', callback_data: `approve_taskorder_${order.id}` }],
                        [{ text: '❌ Відхилити', callback_data: `reject_taskorder_${order.id}` }]
                    ]
                }
            });
        }

        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
});

router.get('/my', authenticateToken, async (req: any, res, next) => {
    try {
        const userId = req.user.userId;
        const orders = await (prisma as any).taskOrder.findMany({
            where: { requesterId: userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(orders);
    } catch (error) {
        next(error);
    }
});

router.get('/:id', authenticateToken, async (req: any, res, next) => {
    try {
        const userId = req.user.userId;
        const orderId = req.params.id;
        const order = await (prisma as any).taskOrder.findUnique({
            where: { id: orderId }
        });
        if (!order || order.requesterId !== userId) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(order);
    } catch (error) {
        next(error);
    }
});

// Approve task order and create quest
router.post('/:id/approve', authenticateToken, async (req: any, res, next) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.userId;

        // Check if user is admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

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
                type: 'WORK', // TaskOrder are considered WORK type
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

        // Notify via messenger if available
        try {
            const studentChatId = process.env.STUDENT_CHAT_ID;
            if (studentChatId) {
                const msg = `✅ **Нове завдання від клієнта!**\n\n` +
                    `📝 ${quest.title}\n` +
                    `💬 ${quest.description || '—'}\n` +
                    `💰 Винагорода: ${quest.reward}€\n` +
                    `📍 ${quest.city || '—'}, ${quest.district || '—'}\n\n` +
                    `Перегляньте в додатку!`;
                
                await messengerHub.sendToMaster(Number(studentChatId), msg);
            }
        } catch (e) {
            console.warn('Failed to send notification:', e);
        }

        res.json({ message: 'Task order approved', quest, order: updatedOrder });
    } catch (error) {
        next(error);
    }
});

// Reject task order
router.post('/:id/reject', authenticateToken, async (req: any, res, next) => {
    try {
        const orderId = req.params.id;
        const userId = req.user.userId;

        // Check if user is admin
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user || user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Admin access required' });
        }

        const order = await (prisma as any).taskOrder.update({
            where: { id: orderId },
            data: { status: 'REJECTED' }
        });

        console.log('[SYNC] TaskOrder rejected:', orderId);

        res.json({ message: 'Task order rejected', order });
    } catch (error) {
        next(error);
    }
});

export default router;
