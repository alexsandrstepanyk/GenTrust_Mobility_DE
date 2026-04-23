import { Telegraf, Context, Markup, session, Scenes } from "telegraf";
import dotenv from "dotenv";
import prisma from "./services/prisma";
import scoutBot from "./bot"; // Import Scout Bot to notify users
import { awardDignity } from "./services/reputation";
import { getAdminMenu, getCategoryFilterMenu } from "./keyboards";

dotenv.config();

const token = process.env.CITY_HALL_BOT_TOKEN;
if (!token) {
    console.warn("CITY_HALL_BOT_TOKEN not set. City Hall features will be disabled.");
}

interface AdminContext extends Context {
    session: any;
    scene: Scenes.SceneContextScene<AdminContext, Scenes.WizardSessionData>;
}

// Create City Hall Bot
export const cityHallBot = token ? new Telegraf<AdminContext>(token) : null;

// Admin Logic
if (cityHallBot) {
    cityHallBot.use(session());

    // --- ADMIN ONBOARDING SCENE ---
    const adminOnboarding = new Scenes.WizardScene<any>(
        "admin_onboarding",
        async (ctx) => {
            const lang = (ctx as any).user?.language || 'de';
            await ctx.reply(lang === 'uk' ? "Оберіть вашу роль:" : "Wählen Sie Ihre Rolle:", 
                Markup.keyboard([["👑 Bürgermeister", "🛡️ Stadtrat"], ["🚪 Скасувати"]]).oneTime().resize());
            return ctx.wizard.next();
        },
        async (ctx) => {
            if (ctx.message?.text === "🚪 Скасувати") {
                const lang = (ctx as any).user?.language || 'de';
                await ctx.reply("Скасовано.", getAdminMenu(lang));
                return ctx.scene.leave();
            }
            const role = ctx.message?.text;
            const lang = (ctx as any).user?.language || 'de';
            await ctx.reply(lang === 'uk' ? `Ви обрали роль: ${role}. Тепер ви модератор мерії.` : `Sie haben die Rolle gewählt: ${role}. Sie sind jetzt City Hall Moderator.`, getAdminMenu(lang));
            return ctx.scene.leave();
        }
    );

    const stage = new Scenes.Stage<any>([adminOnboarding]);
    cityHallBot.use(stage.middleware());

    // Default start command for City Hall
    cityHallBot.start((ctx) => {
        const lang = (ctx as any).user?.language || 'de';
        ctx.reply(lang === 'uk' ? "🏛️ Вітаємо в системі управління містом GenTrust." : "🏛️ Willkommen beim GenTrust City-Management-System.", getAdminMenu(lang));
    });

    // Handle Admin Menu Actions
    cityHallBot.hears([/📊 (Статистика|Statistiken)/, /⚡ (Швидкі дії|Schnelle Aktionen)/, /🏢 (Департаменти|Abteilungen)/], async (ctx) => {
        const lang = (ctx as any).user?.language || 'de';
        ctx.reply(lang === 'uk' ? "Функція в розробці..." : "Funktion in Entwicklung...", getAdminMenu(lang));
    });

    // --- REPORT MODERATION ---

    async function viewReports(ctx: any, priority: string, category?: string) {
        try {
            const where: any = { status: 'PENDING' };
            if (category) where.category = category;
            
            const reports = await prisma.report.findMany({
                where,
                include: { author: true },
                orderBy: { createdAt: 'desc' },
                take: 5
            });

            const lang = (ctx as any).user?.language || 'de';
            if (reports.length === 0) {
                return ctx.reply(lang === 'uk' ? "Нових звітів не знайдено." : "Keine neuen Berichte gefunden.", getAdminMenu(lang));
            }

            for (const report of reports) {
                const isLowPriority = report.author?.urbanBanExpiresAt && new Date(report.author.urbanBanExpiresAt) > new Date();
                const priorityTag = isLowPriority ? "🔴 KAT B" : "🟢 KAT A";
                
                const caption = `📋 REPORT [${priorityTag}]\n📂 Kat: ${report.category}\n👤 User: ${report.author?.firstName}\n📝 ${report.description}\n📍 ${report.latitude}, ${report.longitude}`;
                
                await ctx.replyWithPhoto(report.photoId, {
                    caption: caption,
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("✅ Approve", `approve_report_${report.id}`), Markup.button.callback("❌ Reject", `reject_report_${report.id}`)],
                        [Markup.button.callback("📍 View Map", `map_report_${report.id}`)]
                    ])
                });
            }
        } catch (error) {
            console.error("View reports error:", error);
            const lang = (ctx as any).user?.language || 'de';
            ctx.reply("Помилка завантаження звітів.", getAdminMenu(lang));
        }
    }

    cityHallBot.hears(/🟢 (Категорія А|Kategorie A)/, (ctx) => {
        // @ts-ignore
        ctx.session = { filterPriority: 'A' };
        const lang = (ctx as any).user?.language || 'de';
        ctx.reply(lang === 'uk' ? "Виберіть тип проблеми для Категорії А:" : "Wählen Sie die Art des Problems für Kategorie A:", getCategoryFilterMenu(lang));
    });

    cityHallBot.hears(/🔴 (Категорія Б|Kategorie B)/, (ctx) => {
        // @ts-ignore
        ctx.session = { filterPriority: 'B' };
        const lang = (ctx as any).user?.language || 'de';
        ctx.reply(lang === 'uk' ? "Виберіть тип проблеми для Категорії Б:" : "Wählen Sie die Art des Problems für Kategorie B:", getCategoryFilterMenu(lang));
    });

    cityHallBot.action(/^filter_(.+)/, async (ctx) => {
        const sub = ctx.match[1];
        const lang = (ctx as any).user?.language || 'de';
        if (sub === 'back') return ctx.editMessageText(lang === 'uk' ? "Вибір скасовано." : "Auswahl abgebrochen.", getAdminMenu(lang) as any);

        // @ts-ignore
        const priority = ctx.session?.filterPriority || 'A';
        await ctx.answerCbQuery(lang === 'uk' ? `Шукаю: ${sub}` : `Suche: ${sub}`);
        await viewReports(ctx, priority, sub);
    });

    // --- ADVANCED USER MANAGEMENT ---

    cityHallBot.action(/^manage_user_(.+)/, async (ctx) => {
        const userId = ctx.match[1];
        const lang = (ctx as any).user?.language || 'de';
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) return ctx.answerCbQuery("Користувача не знайдено.");
            
            await ctx.reply(`👤 USER: ${user.firstName}\n🆔 ID: ${user.id}\n⭐ Rep: ${user.dignityScore}\n🏙️ City: ${user.city}`, 
                Markup.inlineKeyboard([
                    [Markup.button.callback("🚫 Ban 24h", `ban_user_${user.id}_24`), Markup.button.callback("⚠️ Warn", `warn_user_${user.id}`)],
                    [Markup.button.callback("✅ Unban", `unban_user_${user.id}`)]
                ]));
        } catch (e) {
            ctx.answerCbQuery("Error loading user info.");
        }
    });

    // --- BUTTON CALLBACK ACTIONS ---

    cityHallBot.action(/^approve_report_(.+)/, async (ctx) => {
        const reportId = ctx.match[1];
        const lang = (ctx as any).user?.language || 'de';
        try {
            await prisma.report.update({
                where: { id: reportId },
                data: { status: 'APPROVED' }
            });
            await ctx.answerCbQuery("Звіт підтверджено ✅");
            await ctx.editMessageCaption("✅ Цей звіт успішно ПІДТВЕРДЖЕНО.");
        } catch (e) {
            ctx.answerCbQuery("Помилка!");
        }
    });

    cityHallBot.action(/^reject_report_(.+)/, async (ctx) => {
        const reportId = ctx.match[1];
        const lang = (ctx as any).user?.language || 'de';
        try {
            await prisma.report.update({
                where: { id: reportId },
                data: { status: 'REJECTED' }
            });
            await ctx.answerCbQuery("Звіт відхилено ❌");
            await ctx.editMessageCaption("❌ Цей звіт ВІДХИЛЕНО як невалідний.");
        } catch (e) {
            ctx.answerCbQuery("Помилка!");
        }
    });

    cityHallBot.hears(/⚙️ (Налаштування|Einstellungen)/, async (ctx) => {
        const lang = (ctx as any).user?.language || 'de';
        ctx.reply(lang === 'uk' ? "Конфігурація мерії..." : "City Hall Konfiguration...", getAdminMenu(lang));
    });

    cityHallBot.hears(/👤 (Профіль|Profil)/, async (ctx) => {
        const lang = (ctx as any).user?.language || 'de';
        ctx.reply(lang === 'uk' ? "Ваш статус: Модератор мерії" : "Ihr Status: City Hall Moderator", getAdminMenu(lang));
    });

    console.log("✅ City Hall Bot logic loaded.");
}
