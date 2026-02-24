import { Telegraf, session, Markup, Scenes } from "telegraf";
import dotenv from "dotenv";
import prisma from "./services/prisma";

dotenv.config();

const token = process.env.MASTER_BOT_TOKEN; // Master Core

export interface MasterContext extends Scenes.WizardContext<Scenes.WizardSessionData> {
    session: any;
    scene: Scenes.SceneContextScene<MasterContext, Scenes.WizardSessionData>;
}

const masterBot = token ? new Telegraf<MasterContext>(token) : null;

if (masterBot) {
    masterBot.use(session());

    masterBot.start((ctx) => {
        ctx.reply(`👑 **GenTrust System Core**\n\nВітаємо, Головний Адміністратор! Оберіть розділ керування:`, Markup.keyboard([
            ["👥 Підтверджені агенти"],
            ["⏳ Очікують підтвердження"],
            ["🚫 Заблоковані", "📊 Статистика"]
        ]).resize());
    });

    // 1. Очікують підтвердження
    masterBot.hears("⏳ Очікують підтвердження", async (ctx) => {
        const pendingUsers = await prisma.user.findMany({ where: { status: "PENDING" } });
        const pendingProviders = await (prisma as any).provider.findMany({ where: { status: "PENDING" } });

        if (pendingUsers.length === 0 && pendingProviders.length === 0) {
            return ctx.reply("📭 Немає нових заявок.");
        }

        let msg = "⏳ **Нові заявки на реєстрацію:**\n\n";

        pendingUsers.forEach((u: any) => {
            msg += `👤 [СКАУТ] ${u.firstName || u.username || u.id.slice(0, 4)}\n/view_user_${u.id}\n\n`;
        });

        pendingProviders.forEach((p: any) => {
            msg += `🏢 [ПРОД] ${p.name} (${p.city})\n/view_provider_${p.id}\n\n`;
        });

        ctx.reply(msg);
    });

    // 2. Підтверджені агенти
    masterBot.hears("👥 Підтверджені агенти", (ctx) => {
        ctx.reply("📂 Оберіть групу агентів:", Markup.inlineKeyboard([
            [Markup.button.callback("🏛️ Мерії (Admin)", "group_admins")],
            [Markup.button.callback("🎒 Школярі (Scouts)", "group_scouts")],
            [Markup.button.callback("🏢 Замовники (Providers)", "group_providers")]
        ]));
    });

    masterBot.action("group_admins", async (ctx) => {
        const admins = await prisma.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" } });
        let msg = "🏛️ **Працівники Мерій (Активні):**\n\n";
        admins.forEach(u => msg += `• ${u.firstName} ${u.lastName} | ID: \`${u.id.slice(0, 8)}\`\n`);
        ctx.reply(msg || "Поки немає підтверджених мерій.", { parse_mode: "Markdown" });
        ctx.answerCbQuery();
    });

    masterBot.action("group_scouts", async (ctx) => {
        const scouts = await prisma.user.findMany({ where: { role: "SCOUT", status: "ACTIVE" } });
        let msg = "🎒 **Школярі-Скаути (Активні):**\n\n";
        scouts.forEach(u => msg += `• ${u.firstName} (${(u as any).city || '—'}) | ID: \`${u.id.slice(0, 8)}\`\n`);
        ctx.reply(msg || "Поки немає підтверджених скаутів.", { parse_mode: "Markdown" });
        ctx.answerCbQuery();
    });

    masterBot.action("group_providers", async (ctx) => {
        const providers = await (prisma as any).provider.findMany({ where: { status: "ACTIVE" } });
        let msg = "🏢 **Замовники / Провайдери (Активні):**\n\n";
        providers.forEach((p: any) => msg += `• ${p.name} (${p.city}) | ID: \`${p.id.slice(0, 8)}\`\n`);
        ctx.reply(msg || "Поки немає підтверджених провайдерів.", { parse_mode: "Markdown" });
        ctx.answerCbQuery();
    });

    // 2.5 Заблоковані
    masterBot.hears("🚫 Заблоковані", async (ctx) => {
        const bannedUsers = await prisma.user.findMany({ where: { status: "BANNED" } });
        const bannedProviders = await (prisma as any).provider.findMany({ where: { status: "BANNED" } });

        let msg = "🚫 **Заблоковані об'єкти:**\n\n";
        bannedUsers.forEach(u => msg += `👤 ${u.firstName} | ID: \`${u.id.slice(0, 8)}\`\n`);
        bannedProviders.forEach((p: any) => msg += `🏢 ${p.name} | ID: \`${p.id.slice(0, 8)}\`\n`);

        ctx.reply(msg || "Список порожній.");
    });

    // 3. Статистика
    masterBot.hears("📊 Статистика", async (ctx) => {
        const usersCount = await prisma.user.count();
        const providersCount = await (prisma as any).provider.count();
        const questsCount = await (prisma as any).quest.count({ where: { status: "COMPLETED" } });

        ctx.reply(`📊 **Глобальна статистика проекту:**\n\n👥 Скаутів: ${usersCount}\n🏢 Провайдерів: ${providersCount}\n✅ Виконано замовлень: ${questsCount}\n\nGenTrust Alpha Core v2.0`, { parse_mode: "Markdown" });
    });

    // 4. Детальний перегляд
    masterBot.hears(/^\/view_user_(.+)/, async (ctx) => {
        const userId = ctx.match[1];
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user) return ctx.reply("Користувача не знайдено.");

        const statusIcon = (user as any).status === "PENDING" ? "⏳" : "✅";
        const msg = `👤 **Інфо про Скаута** ${statusIcon}

🆔 ID: \`${user.id}\`
📝 ПІБ: ${user.firstName} ${user.lastName}
📅 Дата народження: ${user.birthDate}
🏫 Школа: ${user.school}, ${user.grade} клас
📍 Місто/Район: ${(user as any).city}, ${user.district}
📊 Статус: ${(user as any).status}

Оберіть дію:`;

        ctx.reply(msg, {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("✅ Схвалити", `approve_user_${user.id}`), Markup.button.callback("❌ Відхилити", `reject_user_${user.id}`)],
                [Markup.button.callback("🚫 Заблокувати", `ban_user_${user.id}`)]
            ])
        });
    });

    masterBot.hears(/^\/view_provider_(.+)/, async (ctx) => {
        const providerId = ctx.match[1];
        const provider = await (prisma as any).provider.findUnique({ where: { id: providerId } });
        if (!provider) return ctx.reply("Провайдера не знайдено.");

        const msg = `🏢 **Інфо про Провайдера**

🆔 ID: \`${provider.id}\`
🏦 Назва: ${provider.name}
🛠️ Тип: ${provider.type}
🏙️ Місто: ${provider.city}
📊 Статус: ${provider.status}

Оберіть дію:`;

        ctx.reply(msg, {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("✅ Схвалити", `approve_provider_${provider.id}`), Markup.button.callback("❌ Відхилити", `reject_provider_${provider.id}`)],
                [Markup.button.callback("🚫 Заблокувати", `ban_provider_${provider.id}`)]
            ])
        });
    });

    // 5. Обробка схвалення (Actions)
    masterBot.action(/^approve_user_(.+)/, async (ctx) => {
        const userId = ctx.match[1];
        const user = await prisma.user.update({ where: { id: userId }, data: { status: "ACTIVE" } });
        await ctx.answerCbQuery("Користувача підтверджено!");
        await ctx.editMessageText(`✅ Юзера **${user.firstName}** схвалено!`, { parse_mode: "Markdown" });

        // Notify user
        try { await ctx.telegram.sendMessage(Number(user.telegramId), "🎉 Вітаємо! Твій профіль схвалено. Тепер ти можеш користуватися всіма функціями GenTrust Scout!"); } catch (e) { }
    });

    masterBot.action(/^reject_user_(.+)/, async (ctx) => {
        const userId = ctx.match[1];
        const user = await prisma.user.update({ where: { id: userId }, data: { status: "REJECTED" } });
        await ctx.answerCbQuery("Заявку відхилено");
        await ctx.editMessageText(`❌ Юзеру **${user.firstName}** відмовлено.`, { parse_mode: "Markdown" });
        try { await ctx.telegram.sendMessage(Number(user.telegramId), "❌ На жаль, твій профіль не було схвалено модератором."); } catch (e) { }
    });

    masterBot.action(/^approve_provider_(.+)/, async (ctx) => {
        const providerId = ctx.match[1];
        const provider = await (prisma as any).provider.update({ where: { id: providerId }, data: { status: "ACTIVE" } });
        await ctx.answerCbQuery("Провайдера підтверджено!");
        await ctx.editMessageText(`✅ Провайдера **${provider.name}** схвалено!`, { parse_mode: "Markdown" });
        try { await ctx.telegram.sendMessage(Number(provider.telegramId), "🎉 Вітаємо! Вашу компанію схвалено. Тепер ви можете створювати завдання!"); } catch (e) { }
    });


    console.log("[Master Bot] Initialized.");
}

export { masterBot };
