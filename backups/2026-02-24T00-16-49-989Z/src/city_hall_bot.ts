import { Telegraf, Context, Markup, session, Scenes } from "telegraf";
import dotenv from "dotenv";
import prisma from "./services/prisma";
import scoutBot from "./bot"; // Import Scout Bot to notify users
import { awardDignity } from "./services/reputation";
import { adminMenu, categoryFilterMenu } from "./keyboards";

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
            await ctx.reply("🏛️ Вітаємо в системі Мерії GenTrust! Виконується вхід для працівника.\n\nБудь ласка, введіть ваше ПІБ:");
            ctx.session.adminData = {};
            return ctx.wizard.next();
        },
        async (ctx) => {
            ctx.session.adminData.fullName = ctx.message?.text;
            await ctx.reply("🏙️ В якому місті ви працюєте?");
            return ctx.wizard.next();
        },
        async (ctx) => {
            ctx.session.adminData.city = ctx.message?.text;
            const d = ctx.session.adminData;

            // Create/Update user with role ADMIN and status PENDING
            const user = await prisma.user.upsert({
                where: { telegramId: BigInt(ctx.from?.id || 0) },
                update: { role: "ADMIN", status: "PENDING", firstName: d.fullName, city: d.city } as any,
                create: { telegramId: BigInt(ctx.from?.id || 0), role: "ADMIN", status: "PENDING", firstName: d.fullName, city: d.city } as any
            });

            // Notify Master Bot
            const masterBotToken = process.env.CITY_HALL_BOT_TOKEN; // Master Core
            const masterBot = new Telegraf(masterBotToken || "");
            const rootAdminChatId = process.env.ADMIN_CHAT_ID;
            if (rootAdminChatId) {
                const adminMsg = `🆕 **Нова заявка МЕРІЇ (Admin)!**\n\n👤 ${d.fullName}\n🏙️ ${d.city}\n👤 ID: ${user.id}\n\nОберіть дію у Master Bot:`;
                await masterBot.telegram.sendMessage(rootAdminChatId, adminMsg, {
                    parse_mode: "Markdown",
                    ...Markup.inlineKeyboard([
                        [Markup.button.callback("✅ Схвалити Адміна", `approve_user_${user.id}`)],
                        [Markup.button.callback("❌ Відхилити", `reject_user_${user.id}`)]
                    ])
                });
            }

            await ctx.reply("✅ Вашу заявку на доступ до Мерії надіслано до **System Core**. Очікуйте на підтвердження.");
            return ctx.scene.leave();
        }
    );

    const stage = new Scenes.Stage<any>([adminOnboarding]);
    cityHallBot.use(stage.middleware());

    cityHallBot.start(async (ctx) => {
        const user = await prisma.user.findUnique({ where: { telegramId: BigInt(ctx.from?.id || 0) } });

        if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
            if (user?.status === "PENDING") {
                return ctx.reply("⏳ Ваша заявка на модерації у Master Bot. Будь ласка, зачекайте.");
            }
            return ctx.scene.enter("admin_onboarding");
        }

        ctx.reply(`🏛️ Вітаю в Мерії, Адміне ${user.firstName}!`, adminMenu);
    });


    // Helper to view reports by Priority and Category
    const viewReports = async (ctx: Context, priority: 'A' | 'B', subCategory?: string) => {
        const now = new Date();
        const reports = await prisma.report.findMany({
            where: {
                status: "PENDING",
                // @ts-ignore
                category: subCategory || undefined,
                author: priority === 'A'
                    ? { OR: [{ urbanBanExpiresAt: null }, { urbanBanExpiresAt: { lt: now } }] }
                    : { urbanBanExpiresAt: { gt: now } }
            },
            include: { author: true },
            take: 5 // Limit to avoid flood
        });

        if (reports.length === 0) {
            return ctx.reply(`📭 Немає нових звітів у Категорії ${priority}${subCategory ? ` (${subCategory})` : ""}.`, adminMenu);
        }

        await ctx.reply(`🔍 Останні 5 звітів (Категорія ${priority}${subCategory ? `: ${subCategory}` : ""}):`);

        for (const report of reports) {
            const priorityText = priority === 'A' ? "🟢 КАТЕГОРІЯ А" : "🔴 КАТЕГОРІЯ Б";
            // @ts-ignore
            const caption = `${priorityText}\n\n🆔 ID: ${report.id.slice(0, 4)}\n👤 Автор ID: ${report.authorId.slice(0, 8)}\n📂 Категорія: ${report.category}\n📝 Опис: ${report.description || "—"}\n📍 Локація: ${report.latitude}, ${report.longitude}`;

            // We don't have the image buffer here easily without refetching, 
            // but for simplicity in this flow we send text + buttons.
            // In a real app, we'd store the image or just resend the photoId if Telegram allows cross-bot (it usually doesn't without re-uploading)
            await ctx.reply(caption, Markup.inlineKeyboard([
                [Markup.button.callback("✅ Схвалити", `approve_report_${report.id}`), Markup.button.callback("❌ Відхилити", `reject_report_${report.id}`)]
            ]));
        }
    };

    // Category A/B Handlers (Session for filtering)
    cityHallBot.hears("🟢 Категорія А", (ctx) => {
        // @ts-ignore
        ctx.session = { filterPriority: 'A' };
        ctx.reply("Виберіть тип проблеми для Категорії А:", categoryFilterMenu);
    });

    cityHallBot.hears("🔴 Категорія Б", (ctx) => {
        // @ts-ignore
        ctx.session = { filterPriority: 'B' };
        ctx.reply("Виберіть тип проблеми для Категорії Б:", categoryFilterMenu);
    });

    cityHallBot.action(/^filter_(.+)/, async (ctx) => {
        const sub = ctx.match[1];
        if (sub === 'back') return ctx.editMessageText("Вибір скасовано.", adminMenu as any);

        // @ts-ignore
        const priority = ctx.session?.filterPriority || 'A';
        await ctx.answerCbQuery(`Шукаю: ${sub}`);
        await viewReports(ctx, priority, sub);
    });

    // --- ADVANCED USER MANAGEMENT ---

    cityHallBot.action(/^manage_user_(.+)/, async (ctx) => {
        const userId = ctx.match[1];
        try {
            const user = await prisma.user.findUnique({ where: { id: userId } });
            if (!user) return ctx.answerCbQuery("Користувача не знайдено.");

            const isPriorA = !user.urbanBanExpiresAt || new Date(user.urbanBanExpiresAt) < new Date();
            const priorityText = isPriorA ? "🟢 КАТЕГОРІЯ А (Надійний)" : "🔴 КАТЕГОРІЯ Б (Помилки)";

            const info = `👤 **Картка Скаута**
            
🆔 ID: \`${user.id}\`
📝 ПІБ: ${user.firstName || "—"} ${user.lastName || "—"}
📍 Район: ${user.district || "—"}
🏆 Рейтинг: ${user.dignityScore}
📊 Статус: ${priorityText}

Виберіть дію:`;

            await ctx.reply(info, {
                parse_mode: "Markdown",
                ...Markup.inlineKeyboard([
                    [Markup.button.callback("🟢 Зробити Пріоритет А", `set_prior_A_${user.id}`)],
                    [Markup.button.callback("🔴 Перевести в Пріоритет Б", `set_prior_B_${user.id}`)],
                    [Markup.button.callback("👥 Список скаутів", "back_to_settings")]
                ])
            });
            await ctx.answerCbQuery();
        } catch (e) { console.error(e); }
    });

    cityHallBot.action("back_to_settings", async (ctx) => {
        await ctx.answerCbQuery();
        const recentUsers = await prisma.user.findMany({
            where: { role: "SCOUT" },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });

        let msg = "⚙️ **Керування Скаутами (Останні активні)**\n\nВиберіть користувача для дій:";
        const buttons = [];
        for (const u of recentUsers) {
            const isPriorA = !u.urbanBanExpiresAt || new Date(u.urbanBanExpiresAt) < new Date();
            const tag = isPriorA ? "🟢" : "🔴";
            buttons.push([Markup.button.callback(`${tag} ${u.firstName || u.username || u.id.slice(0, 4)}`, `manage_user_${u.id}`)]);
        }
        buttons.push([Markup.button.callback("🔍 Пошук за ID (Інфо)", "settings_info")]);

        await ctx.editMessageText(msg, {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons)
        });
    });

    cityHallBot.action(/^set_prior_(A|B)_(.+)/, async (ctx) => {
        const type = ctx.match[1];
        const userId = ctx.match[2];
        const banDate = type === 'B' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;

        try {
            await prisma.user.update({
                where: { id: userId },
                data: { urbanBanExpiresAt: banDate }
            });
            await ctx.answerCbQuery(`Скаута переведено в Категорію ${type}`);
            await ctx.reply(`✅ Статус оновлено: Скаут тепер у Категорії ${type === 'A' ? 'A (Зелена)' : 'Б (Червона)'}.`, adminMenu);
        } catch (e) { await ctx.answerCbQuery("Помилка."); }
    });

    // Settings Menu - Now with Recent Scouts
    cityHallBot.hears("🏢 Мої налаштування", async (ctx) => {
        const recentUsers = await prisma.user.findMany({
            where: { role: "SCOUT" },
            orderBy: { updatedAt: 'desc' },
            take: 10
        });

        let msg = "⚙️ **Керування Скаутами (Останні активні)**\n\nВиберіть користувача для перегляду його ID та дій:";
        const buttons = [];
        for (const u of recentUsers) {
            const isPriorA = !u.urbanBanExpiresAt || new Date(u.urbanBanExpiresAt) < new Date();
            const tag = isPriorA ? "🟢" : "🔴";
            buttons.push([Markup.button.callback(`${tag} ${u.firstName || u.username || u.id.slice(0, 4)}`, `manage_user_${u.id}`)]);
        }
        buttons.push([Markup.button.callback("🔍 Пошук за ID (Інфо)", "settings_info")]);

        await ctx.reply(msg, {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard(buttons)
        });
    });

    cityHallBot.action("settings_info", (ctx) => ctx.reply("Для пошуку та дій за ID використовуйте:\n`/ban ID` - в Категорію Б\n`/unban ID` - в Категорію А", { parse_mode: "Markdown" }));

    cityHallBot.command("ban", async (ctx) => {
        const id = ctx.message.text.split(' ')[1];
        if (!id) return ctx.reply("Вкажіть ID скаута.");
        const banExpires = new Date();
        banExpires.setDate(banExpires.getDate() + 1); // 24h

        try {
            const result = await prisma.user.updateMany({
                where: { id: { startsWith: id } },
                data: { urbanBanExpiresAt: banExpires }
            });
            if (result.count > 0) ctx.reply(`🚫 Скаута ${id} переведено в Категорію Б на 24 години.`);
            else ctx.reply("Користувача не знайдено.");
        } catch (e) { ctx.reply("Помилка. Перевірте ID."); }
    });

    cityHallBot.command("unban", async (ctx) => {
        const id = ctx.message.text.split(' ')[1];
        if (!id) return ctx.reply("Вкажіть ID скаута.");
        try {
            const result = await prisma.user.updateMany({
                where: { id: { startsWith: id } },
                data: { urbanBanExpiresAt: null }
            });
            if (result.count > 0) ctx.reply(`✅ Скаута ${id} помилувано. Тепер він у Категорії А.`);
            else ctx.reply("Користувача не знайдено.");
        } catch (e) { ctx.reply("Помилка. Перевірте ID."); }
    });


    // Stats Logic
    const showStats = async (ctx: Context) => {
        // ... existing code ...
        try {
            // @ts-ignore
            const stats = await prisma.report.groupBy({
                by: ['category'] as any,
                _count: { id: true },
                where: { status: "APPROVED" }
            });

            const emojiMap: Record<string, string> = {
                "Roads": "🛣️", "Lighting": "💡", "Waste": "🗑️", "Parks": "🌳",
                "Vandalism": "🎨", "Water": "🚰", "Vehicles": "🚗", "Other": "❓"
            };

            let message = "📊 **Аналітика міста (Схвалені звіти):**\n\n";
            stats.forEach((s: any) => {
                const emoji = emojiMap[s.category || ""] || "📋";
                message += `${emoji} ${s.category || "Інше"}: ${s._count.id} шт.\n`;
            });

            if (stats.length === 0) message = "📭 Поки що немає схвалених звітів.";
            await ctx.reply(message, { parse_mode: "Markdown", ...adminMenu });
        } catch (e) {
            console.error(e);
            await ctx.reply("❌ Помилка при отриманні статистики.", adminMenu);
        }
    };

    cityHallBot.command("stats", showStats);
    cityHallBot.hears("📊 Статистика", showStats);

    cityHallBot.hears("📋 Нові звіти", (ctx) => {
        ctx.reply("🔍 Очікуйте нових звітів у цьому чаті. Кожен звіт буде містити фото, категорію та локацію.", adminMenu);
    });

    // Action: Approve Report
    cityHallBot.action(/^approve_report_/, async (ctx: Context) => {
        // @ts-ignore
        const reportId = ctx.match.input.split('_')[2];

        try {
            const report = await prisma.report.findUnique({ where: { id: reportId }, include: { author: true } });
            if (!report) return ctx.answerCbQuery("Звіт не знайдено.");
            if (report.status !== "PENDING") return ctx.answerCbQuery("Звіт вже оброблено.");

            await prisma.report.update({
                where: { id: reportId },
                data: { status: "APPROVED" }
            });

            await awardDignity(report.authorId, 5);

            await ctx.answerCbQuery("✅ Звіт схвалено!");
            await ctx.editMessageCaption(`✅ СХВАЛЕНО\n\nЗвіт від Скаута ID: ${report.authorId.slice(0, 8)} прийнято.\nРейтинг підвищено на +5.`);

            await scoutBot.telegram.sendMessage(Number(report.author.telegramId),
                `🎉 Мерія підтвердила твій звіт!\n\nДякуємо за допомогу місту. \n📈 Твій рейтинг підвищено (+5 балів).\nГарного дня! ☀️`);

        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Помилка.");
        }
    });

    // Action: Reject Report
    cityHallBot.action(/^reject_report_/, async (ctx: Context) => {
        // @ts-ignore
        const reportId = ctx.match.input.split('_')[2];

        try {
            const report = await prisma.report.findUnique({ where: { id: reportId }, include: { author: true } });
            if (!report) return ctx.answerCbQuery("Звіт не знайдено.");
            if (report.status !== "PENDING") return ctx.answerCbQuery("Звіт вже оброблено.");

            const banExpires = new Date();
            banExpires.setDate(banExpires.getDate() + 1);

            await prisma.report.update({
                where: { id: reportId },
                data: { status: "REJECTED" }
            });

            await prisma.user.update({
                where: { id: report.authorId },
                data: {
                    urbanBanExpiresAt: banExpires,
                    dignityScore: { decrement: 5 }
                }
            });

            await ctx.answerCbQuery("❌ Звіт відхилено.");
            await ctx.editMessageCaption(`❌ ВІДХИЛЕНО (ФЕЙК)\n\nСкаута ID: ${report.authorId.slice(0, 8)} переведено в КАТЕГОРІЮ Б на 24 години.`);

            await scoutBot.telegram.sendMessage(Number(report.author.telegramId),
                `⚠️ Твій звіт відхилено Мерією як недостовірний.\n\n📉 Рейтинг знижено (-5).\n🔴 Твої наступні звіти протягом 24 годин будуть позначатися як "Низький пріоритет" (Категорія Б). Будь ласка, надсилай тільки правдиву інформацію!`);

        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Помилка.");
        }
    });

    // --- PROVIDER MODERATION ---
    cityHallBot.action(/^approve_provider_(\d+)/, async (ctx) => {
        const providerTid = ctx.match[1];
        try {
            await (prisma as any).provider.update({
                where: { telegramId: BigInt(providerTid) },
                data: { status: "ACTIVE" }
            });

            await ctx.answerCbQuery("✅ Провайдера схвалено!");
            await ctx.editMessageText((ctx.callbackQuery.message as any).text + "\n\n✅ **СХВАЛЕНО**", { parse_mode: "Markdown" });

            // Notify provider (we can use cityHallBot even if it's a different token, but wait 
            // - actually we MUST use the correct bot token to message users who started THAT bot.
            // But Telegram allows any bot to message a user who has started it.
            // We'll use a generic approach or assume the provider already started the Provider Bot.
            // Since we don't have questProviderBot exported easily for messaging here, 
            // we'll use a trick: the user has surely started the Provider Bot.
            // But we need the Provider Bot's token. 
            // For now, we'll try to use cityHallBot to notify, assuming they might have started it too, 
            // OR better, we just rely on the fact that we're in the same process and can import.
        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Помилка БД.");
        }
    });

    cityHallBot.action(/^reject_provider_(\d+)/, async (ctx) => {
        const providerTid = ctx.match[1];
        try {
            await (prisma as any).provider.update({
                where: { telegramId: BigInt(providerTid) },
                data: { status: "REJECTED" }
            });

            await ctx.answerCbQuery("❌ Відхилено");
            await ctx.editMessageText((ctx.callbackQuery.message as any).text + "\n\n❌ **ВІДХИЛЕНО**", { parse_mode: "Markdown" });
        } catch (e) {
            console.error(e);
            await ctx.answerCbQuery("Помилка БД.");
        }
    });
}
