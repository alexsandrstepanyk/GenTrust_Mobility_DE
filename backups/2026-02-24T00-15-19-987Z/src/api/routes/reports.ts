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
                photoId: 'MOBILE_UPLOAD',
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

export default router;
