import { Router } from 'express';
import { Prisma } from '@prisma/client';
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

        const txResult = await prisma.$transaction(async (tx: any) => {
            const order = await tx.taskOrder.findUnique({ where: { id: orderId } });

            if (!order) {
                return { notFound: true };
            }

            const existingQuest = await tx.quest.findUnique({ where: { taskOrderId: orderId } });
            if (order.status === 'PUBLISHED' || existingQuest) {
                const publishedOrder = order.status === 'PUBLISHED'
                    ? order
                    : await tx.taskOrder.update({
                        where: { id: orderId },
                        data: { status: 'PUBLISHED' }
                    });

                return {
                    alreadyProcessed: true,
                    quest: existingQuest,
                    order: publishedOrder
                };
            }

            if (order.status !== 'PENDING_MODERATION') {
                return { invalidStatus: true, status: order.status };
            }

            const quest = await tx.quest.create({
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

            const updatedOrder = await tx.taskOrder.update({
                where: { id: orderId },
                data: { status: 'PUBLISHED' }
            });

            return { quest, order: updatedOrder, alreadyProcessed: false };
        });

        if ((txResult as any).notFound) {
            return res.status(404).json({ error: 'Task order not found' });
        }

        if ((txResult as any).invalidStatus) {
            return res.status(409).json({
                error: `Task order cannot be approved from status ${(txResult as any).status}`
            });
        }

        const quest = (txResult as any).quest;
        const updatedOrder = (txResult as any).order;
        const alreadyProcessed = Boolean((txResult as any).alreadyProcessed);

        console.log('[SYNC] TaskOrder approved and converted to Quest:', {
            taskOrderId: updatedOrder.id,
            questId: quest?.id,
            title: quest?.title,
            alreadyProcessed
        });

        // Notify via messenger if available
        try {
            const studentChatId = process.env.STUDENT_CHAT_ID;
            if (studentChatId) {
                const msg = `✅ **Нове завдання від клієнта!**\n\n` +
                    `📝 ${quest?.title || 'Завдання'}\n` +
                    `💬 ${quest?.description || '—'}\n` +
                    `💰 Винагорода: ${quest?.reward ?? '—'}€\n` +
                    `📍 ${quest?.city || '—'}, ${quest?.district || '—'}\n\n` +
                    `Перегляньте в додатку!`;
                
                await messengerHub.sendToMaster(Number(studentChatId), msg);
            }
        } catch (e) {
            console.warn('Failed to send notification:', e);
        }

        const io = (global as any).io;
        if (io) {
            io.to('stats').emit('stats:update', {
                scope: 'task_orders',
                action: alreadyProcessed ? 'approve_idempotent' : 'approved',
                orderId,
                questId: quest?.id || null,
                timestamp: new Date().toISOString()
            });
        }

        res.json({
            message: alreadyProcessed ? 'Task order already approved' : 'Task order approved',
            quest,
            order: updatedOrder,
            idempotent: alreadyProcessed
        });
    } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
            try {
                const orderId = req.params.id;
                const [order, quest] = await Promise.all([
                    (prisma as any).taskOrder.findUnique({ where: { id: orderId } }),
                    (prisma as any).quest.findUnique({ where: { taskOrderId: orderId } })
                ]);

                if (order && quest) {
                    return res.json({
                        message: 'Task order already approved',
                        quest,
                        order,
                        idempotent: true
                    });
                }
            } catch (nestedError) {
                return next(nestedError);
            }
        }
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
