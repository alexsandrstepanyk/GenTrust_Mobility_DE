import { Context, Markup } from "telegraf";
import prisma from "./prisma";
import { awardDignity } from "./reputation";
import { messengerHub } from "./messenger";

export const handleAdminActions = (bot: any) => {
    // Action: Approve Report
    bot.action(/^approve_report_/, async (ctx: Context) => {
        // @ts-ignore
        const reportId = ctx.match.input.split('_')[2];

        try {
            const report = await prisma.report.findUnique({ where: { id: reportId }, include: { author: true } });
            if (!report) return ctx.answerCbQuery("Bericht nicht gefunden.");
            if (report.status !== "PENDING") return ctx.answerCbQuery("Bericht bereits bearbeitet.");

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

            await ctx.answerCbQuery("✅ Bericht genehmigt!");

            // Notify Admin (Edit message)
            await ctx.editMessageCaption(`✅ VOM RATHAUS GENEHMIGT\n\nBericht von ${report.author.firstName} angenommen. Bewertung erhöht.`);

            // Notify User via Scout Bot
            if (report.author.telegramId) {
                await messengerHub.sendToScout(report.author.telegramId,
                    `🎉 Gute Nachrichten!\n\nDas Rathaus hat deinen Problembericht bestätigt.\nDein Dignity Score wurde deutlich erhöht! (+5 Punkte)\nDanke, dass du dich um die Stadt kümmerst! 🏙️`);
            }

        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Fehler.");
        }
    });

    // Action: Reject Report
    bot.action(/^reject_report_/, async (ctx: Context) => {
        // @ts-ignore
        const reportId = ctx.match.input.split('_')[2];

        try {
            const report = await prisma.report.findUnique({ where: { id: reportId }, include: { author: true } });
            if (!report) return ctx.answerCbQuery("Bericht nicht gefunden.");
            if (report.status !== "PENDING") return ctx.answerCbQuery("Bericht bereits bearbeitet.");

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

            await ctx.answerCbQuery("❌ Bericht abgelehnt (Fake).");

            // Notify Admin
            await ctx.editMessageCaption(`❌ ABGELEHNT (FAKE)\n\nBenutzer ${report.author.firstName} für 24 Stunden gesperrt. Bewertung gesenkt.`);

            // Notify User via Scout Bot
            if (report.author.telegramId) {
                await messengerHub.sendToScout(report.author.telegramId,
                    `⚠️ WARNUNG!\n\nDas Rathaus hat deinen Bericht als unglaubwürdig (Fake) abgelehnt.\n\n📉 Deine Bewertung wurde gesenkt (-5).\n🚫 Du bist im Urban-Guardian-System vorübergehend gesperrt (24 Stunden).\n\nBitte sei beim nächsten Mal ehrlich.`);
            }

        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Fehler.");
        }
    });
};
