import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth';
import axios from 'axios';
import { notifyPersonalTaskCreated } from '../../services/questNotifications';

const router = express.Router();
const prisma: any = new PrismaClient();
const EXPO_PUSH_API = 'https://exp.host/--/api/v2/push/send';

// 1. РЕЄСТРАЦІЯ БАТЬКА
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName, phone } = req.body;

        if (!email || !password || !firstName) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Перевірка чи батько вже існує
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(400).json({ error: 'Email already in use' });
        }

        // Хешування пароля
        const bcrypt = require('bcryptjs');
        const passwordHash = await bcrypt.hash(password, 10);

        // Створення батька
        const parent = await prisma.user.create({
            data: {
                email,
                passwordHash,
                firstName,
                lastName,
                role: 'PARENT',
                status: 'ACTIVE'
            }
        });

        res.json({ 
            id: parent.id, 
            message: 'Parent registered successfully',
            role: 'PARENT'
        });
    } catch (error: any) {
        console.error('Parent registration error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 2. БАТЬКО ПРИЙМАЄ ЗАПИТ НА ЗӘЯЗОК З ДИТИНОЮ
router.post('/approve-child', authenticateToken, async (req: any, res) => {
    try {
        const parentId = req.user.userId;
        const { approvalCode } = req.body;

        if (!approvalCode) {
            return res.status(400).json({ error: 'Approval code is required' });
        }

        // Знаходимо очікуючий зв'язок з цим кодом
        const parentChild = await prisma.parentChild.findFirst({
            where: {
                parentId,
                approvalCode,
                status: 'PENDING'
            },
            include: { child: true }
        });

        if (!parentChild) {
            return res.status(400).json({ error: 'Invalid or expired approval code' });
        }

        // Підтверджуємо
        const approved = await prisma.parentChild.update({
            where: { id: parentChild.id },
            data: {
                status: 'APPROVED',
                approvedAt: new Date(),
                approvedBy: parentId
            }
        });

        // Оновлюємо статус дитини якщо всі батьки затвердили
        const child = await prisma.user.findUnique({
            where: { id: parentChild.childId },
            include: { childRelations: true }
        });

        const allApproved = child?.childRelations.every((rel: any) => rel.status === 'APPROVED');
        if (allApproved && child?.status === 'PENDING') {
            await prisma.user.update({
                where: { id: parentChild.childId },
                data: { status: 'ACTIVE' }
            });
        }

        // Надсилаємо push дитині
        const childPushToken = child?.pushToken;
        if (childPushToken) {
            await axios.post(EXPO_PUSH_API, {
                to: childPushToken,
                sound: 'default',
                title: '✅ Батько схвалив вас!',
                body: `${child?.firstName || 'Батько'} підтвердив вашу реєстрацію. Тепер ви можете використовувати додаток!`
            }).catch(err => console.error('Push error:', err));
        }

        res.json({ message: 'Child approved successfully', child: { id: child?.id, name: child?.firstName } });
    } catch (error: any) {
        console.error('Approval error:', error);
        res.status(500).json({ error: error.message });
    }
});

// 3. ОТРИМАННЯ СПИСКУ ДІТЕЙ БАТЬКА
router.get('/children', authenticateToken, async (req: any, res) => {
    try {
        const parentId = req.user.userId;

        const children = await prisma.parentChild.findMany({
            where: { parentId },
            include: {
                child: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        grade: true,
                        school: true,
                        balance: true,
                        dignityScore: true,
                        status: true
                    }
                }
            }
        });

        res.json(children);
    } catch (error: any) {
        console.error('Error fetching children:', error);
        res.status(500).json({ error: error.message });
    }
});

// 4. GPS ЛОКАЦІЯ ДИТИНИ (батьки можуть переглядати)
router.get('/child/:childId/location', authenticateToken, async (req: any, res) => {
    try {
        const parentId = req.user.userId;
        const { childId } = req.params;

        // Перевіряємо чи батько пов'язаний з цією дитиною
        const relation = await prisma.parentChild.findFirst({
            where: {
                parentId,
                childId,
                status: 'APPROVED',
                canTrackGPS: true
            }
        });

        if (!relation) {
            return res.status(403).json({ error: 'No permission to track this child' });
        }

        // Отримуємо найсвіжішу локацію
        const location = await prisma.gPSLocation.findFirst({
            where: { userId: childId },
            orderBy: { timestamp: 'desc' },
            take: 1
        });

        res.json(location || { message: 'No location data available' });
    } catch (error: any) {
        console.error('Error fetching location:', error);
        res.status(500).json({ error: error.message });
    }
});

// 5. ОТРИМАННЯ ІСТОРІЇ ЛОКАЦІЙ ДИТИНИ
router.get('/child/:childId/locations', authenticateToken, async (req: any, res) => {
    try {
        const parentId = req.user.userId;
        const { childId } = req.params;
        const { limit = 50 } = req.query;

        // Перевіряємо дозвіл
        const relation = await prisma.parentChild.findFirst({
            where: {
                parentId,
                childId,
                status: 'APPROVED',
                canTrackGPS: true
            }
        });

        if (!relation) {
            return res.status(403).json({ error: 'No permission' });
        }

        const locations = await prisma.gPSLocation.findMany({
            where: { userId: childId },
            orderBy: { timestamp: 'desc' },
            take: Number(limit)
        });

        res.json(locations);
    } catch (error: any) {
        console.error('Error fetching locations:', error);
        res.status(500).json({ error: error.message });
    }
});

// 6. АКТИВНІСТЬ ДИТИНИ (виконані завдання)
router.get('/child/:childId/activity', authenticateToken, async (req: any, res) => {
    try {
        const parentId = req.user.userId;
        const { childId } = req.params;

        // Перевіряємо дозвіл
        const relation = await prisma.parentChild.findFirst({
            where: {
                parentId,
                childId,
                status: 'APPROVED',
                canViewQuests: true
            }
        });

        if (!relation) {
            return res.status(403).json({ error: 'No permission to view activity' });
        }

        // Виконані квести
        const completedQuests = await prisma.quest.findMany({
            where: {
                assigneeId: childId,
                status: 'COMPLETED'
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        // Статистика дитини
        const child = await prisma.user.findUnique({
            where: { id: childId },
            select: {
                firstName: true,
                lastName: true,
                balance: true,
                dignityScore: true,
                status: true
            }
        });

        res.json({
            child,
            completedQuests,
            stats: {
                totalCompleted: completedQuests.length,
                totalEarned: completedQuests.reduce((sum: number, q: any) => sum + q.reward, 0)
            }
        });
    } catch (error: any) {
        console.error('Error fetching activity:', error);
        res.status(500).json({ error: error.message });
    }
});

// 7. СТВОРЕННЯ ПЕРСОНАЛЬНОГО ЗАВДАННЯ
router.post('/create-task', authenticateToken, async (req: any, res) => {
    try {
        const parentId = req.user.userId;
        const { childId, title, description, reward, dueDate } = req.body;

        // Перевіряємо дозвіл
        const relation = await prisma.parentChild.findFirst({
            where: {
                parentId,
                childId,
                status: 'APPROVED',
                canCreateTasks: true
            }
        });

        if (!relation) {
            return res.status(403).json({ error: 'No permission to create tasks for this child' });
        }

        const task = await prisma.personalTask.create({
            data: {
                creatorId: parentId,
                assignedChildId: childId,
                title,
                description,
                reward: reward || 0,
                dueDate: dueDate ? new Date(dueDate) : null
            }
        });

        // Створюємо персональний квест для дитини, щоб вона могла виконати його з фото-звітом
        const child = await prisma.user.findUnique({ where: { id: childId } });
        const quest = await (prisma as any).quest.create({
            data: {
                title,
                description,
                type: 'WORK',
                status: 'OPEN',
                reward: Number(reward || 0),
                city: child?.city || null,
                district: child?.district || null,
                isPersonal: true,
                assignedToChild: childId,
                requiresPhoto: true,
                autoApprove: false
            }
        });

        // Надсилаємо push дитині
        notifyPersonalTaskCreated(task.id).catch(e => console.error('[PUSH] Failed to notify personal task created:', e));

        res.json({ message: 'Task created successfully', task, quest });
    } catch (error: any) {
        console.error('Error creating task:', error);
        res.status(500).json({ error: error.message });
    }
});

// 8. ОТРИМАННЯ ПЕРСОНАЛЬНИХ ЗАВДАНЬ
router.get('/child/:childId/personal-tasks', authenticateToken, async (req: any, res) => {
    try {
        const parentId = req.user.userId;
        const { childId } = req.params;

        // Перевіряємо дозвіл
        const relation = await prisma.parentChild.findFirst({
            where: {
                parentId,
                childId,
                status: 'APPROVED'
            }
        });

        if (!relation) {
            return res.status(403).json({ error: 'No permission' });
        }

        const tasks = await prisma.personalTask.findMany({
            where: {
                creatorId: parentId,
                OR: [
                    { audience: 'GLOBAL' },
                    { assignedChildId: childId }
                ]
            },
            orderBy: { createdAt: 'desc' }
        });

        res.json(tasks);
    } catch (error: any) {
        console.error('Error fetching tasks:', error);
        res.status(500).json({ error: error.message });
    }
});

// 9. БЛОКУВАННЯ ДИТИНИ
router.post('/block-child/:childId', authenticateToken, async (req: any, res) => {
    try {
        const parentId = req.user.userId;
        const { childId } = req.params;

        const relation = await prisma.parentChild.findFirst({
            where: { parentId, childId }
        });

        if (!relation) {
            return res.status(403).json({ error: 'No permission' });
        }

        await prisma.parentChild.update({
            where: { id: relation.id },
            data: { status: 'BLOCKED' }
        });

        res.json({ message: 'Child blocked successfully' });
    } catch (error: any) {
        console.error('Error blocking child:', error);
        res.status(500).json({ error: error.message });
    }
});

export default router;
