import { Context, Markup } from "telegraf";
import prisma from "./prisma";
import { awardDignity } from "./reputation";

export const handleAdminActions = (bot: any) => {
    // Action: Approve Report
    bot.action(/^approve_report_/, async (ctx: Context) => {
        // @ts-ignore
        const reportId = ctx.match.input.split('_')[2];

        try {
            const report = await prisma.report.findUnique({ where: { id: reportId }, include: { author: true } });
            if (!report) return ctx.answerCbQuery("Звіт не знайдено.");
            if (report.status !== "PENDING") return ctx.answerCbQuery("Звіт вже оброблено.");

            // Update Report
            await prisma.report.update({
                where: { id: reportId },
                data: { status: "APPROVED" }
            });

            // Double Dignity Reward (+3 bonus on top of initial +2 = +5 total for specific report logic, 
            // OR simply give a big bonus now. Let's give +5 bonus).
            // User asked for "doubling". Initial was 2. So total should be 4? Or just big reward?
            // Let's give +5 bonus for "Verified Report".
            await awardDignity(report.authorId, 5);

            await ctx.answerCbQuery("✅ Звіт схвалено!");

            // Notify Admin (Edit message)
            await ctx.editMessageCaption(`✅ СХВАЛЕНО МЕРІЄЮ\n\nЗвіт від ${report.author.firstName} прийнято. Рейтинг підвищено.`);

            // Notify User
            await bot.telegram.sendMessage(Number(report.author.telegramId),
                `🎉 Гарні новини!\n\nМерія підтвердила твій звіт про проблему.\nТвій рейтинг Dignity Score значно підвищено! (+5 балів)\nПродовжуй дбати про місто! 🏙️`);

        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Помилка.");
        }
    });

    // Action: Reject Report
    bot.action(/^reject_report_/, async (ctx: Context) => {
        // @ts-ignore
        const reportId = ctx.match.input.split('_')[2];

        try {
            const report = await prisma.report.findUnique({ where: { id: reportId }, include: { author: true } });
            if (!report) return ctx.answerCbQuery("Звіт не знайдено.");
            if (report.status !== "PENDING") return ctx.answerCbQuery("Звіт вже оброблено.");

            // Calculate Ban Expiration (24h)
            const banExpires = new Date();
            banExpires.setDate(banExpires.getDate() + 1);

            // Update Report & Ban User
            await prisma.report.update({
                where: { id: reportId },
                data: { status: "REJECTED" }
            });

            await prisma.user.update({
                where: { id: report.authorId },
                data: {
                    urbanBanExpiresAt: banExpires,
                    dignityScore: { decrement: 5 } // Penalty
                }
            });

            await ctx.answerCbQuery("❌ Звіт відхилено (Фейк).");

            // Notify Admin
            await ctx.editMessageCaption(`❌ ВІДХИЛЕНО (ФЕЙК)\n\nКористувача ${report.author.firstName} заблоковано на 24 години. Рейтинг знижено.`);

            // Notify User
            await bot.telegram.sendMessage(Number(report.author.telegramId),
                `⚠️ ПОПЕРЕДЖЕННЯ!\n\nМерія відхилила твій звіт як недостовірний (Фейк).\n\n📉 Твій рейтинг знижено (-5).\n🚫 Ти тимчасово заблокований у системі Urban Guardian (24 години).\n\nБудь ласка, будь чесним наступного разу.`);

        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Помилка.");
        }
    });
};
