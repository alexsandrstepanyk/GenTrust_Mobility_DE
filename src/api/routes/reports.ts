import { Router } from 'express';
import prisma from '../../services/prisma';
import { analyzeImage } from '../../services/gemini';
import { authenticateToken } from '../middleware/auth';
import { awardDignity } from '../../services/reputation';
import { recordActivity } from '../../services/life_recorder';
import { cityHallBot } from '../../city_hall_bot';
import { Markup } from 'telegraf';

const router = Router();

// Analyze photo (before submitting report)
router.post('/analyze', authenticateToken, async (req: any, res, next) => {
    try {
        const { photoBase64, description } = req.body;

        if (!photoBase64) {
            return res.status(400).json({ error: 'Photo is required' });
        }

        const buffer = Buffer.from(photoBase64, 'base64');

        // AI Analysis
        const analysis = await analyzeImage(buffer, description);

        res.json(analysis);
    } catch (error) {
        console.error('Analysis error:', error);
        next(error);
    }
});

// Submit a report
router.post('/', authenticateToken, async (req: any, res, next) => {
    try {
        const { photoBase64, latitude, longitude, description, category: userCategory, aiVerdict } = req.body;
        const userId = req.user.userId;

        if (!photoBase64 || !latitude || !longitude) {
            return res.status(400).json({ error: 'Photo and location are required' });
        }

        if (!userCategory) {
            return res.status(400).json({ error: 'Category is required' });
        }

        const buffer = Buffer.from(photoBase64, 'base64');

        // Use provided AI verdict or analyze now
        let analysis;
        if (aiVerdict) {
            analysis = typeof aiVerdict === 'string' ? JSON.parse(aiVerdict) : aiVerdict;
        } else {
            analysis = await analyzeImage(buffer, description);
        }
        
        const category = userCategory;

        const report = await (prisma as any).report.create({
            data: {
                authorId: userId,
            // Store inline image for dashboard preview (quick fix for missing photo route)
            photoId: `data:image/jpeg;base64,${photoBase64}`,
                aiVerdict: JSON.stringify(analysis),
                category,
                description,
                latitude,
                longitude,
            }
        });

        await awardDignity(userId, 2);
        await recordActivity(userId, 'REPORT_SUBMITTED', { reportId: report.id, category });

        // Notify City Hall (Logic from urban_guardian.ts)
        const adminChatId = process.env.ADMIN_CHAT_ID;
        if (cityHallBot && adminChatId && adminChatId !== '0') {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            const isLowPriority = user?.urbanBanExpiresAt && new Date(user.urbanBanExpiresAt) > new Date();
            const priorityZone = isLowPriority ? "🔴 KATEGORIE B" : "🟢 KATEGORIE A";

            const caption = `🏛️ MOBILE REPORT (ID: ${report.id.slice(0, 4)})\n\n${priorityZone}\n\n👤 Autor ID: ${userId.slice(0, 8)}\n📂 Kategorie: ${category}\n📍 Standort: ${latitude}, ${longitude}`;

            await cityHallBot.telegram.sendPhoto(adminChatId, { source: buffer }, {
                caption: caption,
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("✅ Bestätigen", `approve_report_${report.id}`), Markup.button.callback("❌ Fake", `reject_report_${report.id}`)],
                    [Markup.button.callback("👤 Autor verwalten", `manage_user_${report.authorId}`)]
                ])
            });
        }

        res.status(201).json({ report, beautyResult: analysis });
    } catch (error) {
        next(error);
    }
});

// List ALL reports (for city hall dashboard)
router.get('/', async (req, res, next) => {
    try {
        const { status, category, limit = '100' } = req.query;

        const where: any = {};
        if (status) where.status = status;
        if (category) where.category = category;

        const reports = await prisma.report.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string)
        });

        // Transform for frontend
        const transformed = reports.map((report: any) => ({
            id: report.id,
            title: report.category || 'Звіт',
            description: report.description || 'Без опису',
            status: report.status || 'PENDING',
            category: report.category || 'Інше',
            location: report.latitude && report.longitude ? {
                lat: report.latitude,
                lng: report.longitude
            } : null,
            photoUrl: report.photoId
                ? (String(report.photoId).startsWith('data:image')
                    ? report.photoId
                    : `/api/photos/${report.photoId}`)
                : null,
            createdBy: {
                name: report.author?.firstName || report.author?.username || 'Анонім',
                email: report.author?.email || ''
            },
            createdAt: report.createdAt,
            priority: report.priority || 'MEDIUM',
            aiVerdict: report.aiVerdict ? JSON.parse(report.aiVerdict) : null
        }));

        res.json(transformed);
    } catch (error) {
        console.error('Get all reports error:', error);
        next(error);
    }
});

// Approve report
router.post('/:id/approve', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { department } = req.body;
        
        const report = await (prisma as any).report.update({
            where: { id },
            data: { 
                status: 'APPROVED',
                forwardedTo: department || 'general'
            }
        });

        res.json({ success: true, report });
    } catch (error) {
        next(error);
    }
});

// Reject report
router.post('/:id/reject', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        
        const report = await (prisma as any).report.update({
            where: { id },
            data: { 
                status: 'REJECTED',
                rejectionReason: reason
            }
        });

        res.json({ success: true, report });
    } catch (error) {
        next(error);
    }
});

// Forward report to department
router.post('/:id/forward', async (req, res, next) => {
    try {
        const { id } = req.params;
        const { to } = req.body; // department: utilities, transport, ecology
        
        const report = await (prisma as any).report.update({
            where: { id },
            data: { 
                status: 'FORWARDED',
                forwardedTo: to
            }
        });

        res.json({ success: true, report });
    } catch (error) {
        next(error);
    }
});

// Get report statistics
router.get('/stats/overview', async (req, res, next) => {
    try {
        const [total, pending, approved, rejected, forwarded] = await Promise.all([
            (prisma as any).report.count(),
            (prisma as any).report.count({ where: { status: 'PENDING' } }),
            (prisma as any).report.count({ where: { status: 'APPROVED' } }),
            (prisma as any).report.count({ where: { status: 'REJECTED' } }),
            (prisma as any).report.count({ where: { status: 'FORWARDED' } })
        ]);

        // Category breakdown
        const categoryStats = await prisma.$queryRaw`
            SELECT category, COUNT(*)::int as count
            FROM "Report"
            WHERE category IS NOT NULL
            GROUP BY category
            ORDER BY count DESC
        `;

        // Reports over time (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const dailyReports = await prisma.$queryRaw`
            SELECT 
                DATE("createdAt") as date,
                COUNT(*)::int as count
            FROM "Report"
            WHERE "createdAt" >= ${thirtyDaysAgo}
            GROUP BY DATE("createdAt")
            ORDER BY date ASC
        `;

        res.json({
            total,
            pending,
            approved,
            rejected,
            forwarded,
            byCategory: categoryStats,
            dailyReports
        });
    } catch (error) {
        console.error('Stats error:', error);
        next(error);
    }
});

// List user reports
router.get('/my', authenticateToken, async (req: any, res, next) => {
    try {
        const reports = await prisma.report.findMany({
            where: { authorId: req.user.userId },
            orderBy: { createdAt: 'desc' }
        });
        res.json(reports);
    } catch (error) {
        next(error);
    }
});

// ========================================
// DEPARTMENT ENDPOINTS
// ========================================
// Отримати звіти конкретного департаменту
router.get('/department/:deptId', async (req, res, next) => {
    try {
        const { deptId } = req.params; // roads, lighting, waste, parks, water, transport, ecology, vandalism
        const { status, limit = '100' } = req.query;

        const where: any = {
            forwardedTo: deptId
        };
        
        if (status) where.status = status;

        const reports = await prisma.report.findMany({
            where,
            include: {
                author: {
                    select: {
                        id: true,
                        username: true,
                        firstName: true,
                        lastName: true,
                        email: true
                    }
                }
            },
            orderBy: { createdAt: 'desc' },
            take: parseInt(limit as string)
        });

        // Transform for frontend
        const transformed = reports.map((report: any) => ({
            id: report.id,
            title: report.category || 'Звіт',
            description: report.description || 'Без опису',
            status: report.status || 'PENDING',
            category: report.category || 'Інше',
            location: report.latitude && report.longitude ? {
                lat: report.latitude,
                lng: report.longitude
            } : null,
            photoUrl: report.photoId
                ? (String(report.photoId).startsWith('data:image')
                    ? report.photoId
                    : `/api/photos/${report.photoId}`)
                : null,
            createdBy: {
                name: report.author?.firstName || report.author?.username || 'Анонім',
                email: report.author?.email || ''
            },
            createdAt: report.createdAt,
            forwardedTo: report.forwardedTo
        }));

        res.json(transformed);
    } catch (error) {
        next(error);
    }
});

// Отримати статистику департаменту
router.get('/department/:deptId/stats', async (req, res, next) => {
    try {
        const { deptId } = req.params;

        const [total, pending, approved, rejected, inProgress] = await Promise.all([
            prisma.report.count({ where: { forwardedTo: deptId } }),
            prisma.report.count({ where: { forwardedTo: deptId, status: 'PENDING' } }),
            prisma.report.count({ where: { forwardedTo: deptId, status: 'APPROVED' } }),
            prisma.report.count({ where: { forwardedTo: deptId, status: 'REJECTED' } }),
            prisma.report.count({ where: { forwardedTo: deptId, status: 'IN_PROGRESS' } })
        ]);

        res.json({
            department: deptId,
            totalReports: total,
            pendingReports: pending,
            approvedReports: approved,
            rejectedReports: rejected,
            inProgressReports: inProgress
        });
    } catch (error) {
        next(error);
    }
});

export default router;
