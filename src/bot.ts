import { Telegraf, Scenes, session } from "telegraf";
import dotenv from "dotenv";
import { authMiddleware, BotContext } from "./middleware/auth";
import { safetyMiddleware } from "./middleware/safety";
import { onboardingScene } from "./scenes/onboarding";
import { urbanGuardianScene } from "./scenes/urban_guardian";
import { logisticsScene } from "./scenes/logistics";
import { Markup } from "telegraf";
import { cityHallBot } from "./city_hall_bot";
import { awardDignity, getLeaderboard } from "./services/reputation";
import { mainMenu } from "./keyboards";
import prisma from "./services/prisma";
import { getQuestVerifiers, notifyCompletionSubmitted } from "./services/task_completion";
import { recordActivity } from "./services/life_recorder";

dotenv.config();

const botToken = process.env.BOT_TOKEN;
if (!botToken) throw new Error("BOT_TOKEN must be provided!");
const bot = new Telegraf<BotContext>(botToken);

console.log("[Bot] Initialized.");

bot.use((ctx, next) => {
    console.log(`[Incoming] ${ctx.updateType} from ${ctx.from?.id || 'unknown'} - Text: ${('message' in ctx.update && 'text' in ctx.update.message) ? ctx.update.message.text : 'non-text'}`);
    return next();
});

const stage = new Scenes.Stage<BotContext>([onboardingScene, urbanGuardianScene, logisticsScene]);

bot.use(session());
bot.use(authMiddleware);
bot.use(safetyMiddleware);
bot.use(stage.middleware());

bot.catch((err: any, ctx: BotContext) => {
    console.error(`[Global Error] Update ${ctx.updateType} caused error:`, err);

    // Більш детальна помилка для користувача
    if (err.description?.includes("wrong file identifier")) {
        ctx.reply("❌ Помилка передачі зображення. Спробуйте надіслати фото ще раз.").catch(console.error);
    } else {
        ctx.reply("❌ Сталася внутрішня помилка сервера. Наші інженери вже працюють над цим!").catch(console.error);
    }
});

bot.start((ctx) => {
    console.log(`[Bot] /start command triggered by ${ctx.from?.id}`);

    // If not onboarded or missing city/district, enter onboarding
    if (ctx.user?.status === "PENDING" || !ctx.user?.district || !ctx.user?.city) {
        ctx.scene.enter("onboarding");
        return;
    }

    ctx.reply(`Вітаю, ${ctx.user?.firstName || ctx.user?.username || 'скаут'}! 
Ти в системі GenTrust Alpha. Твій рейтинг допомагає місту ставати кращим. ✨

Використовуй меню нижче для навігації:`, mainMenu);
});

// Navigation Handlers
bot.command("report", (ctx) => ctx.scene.enter("urban_guardian"));
// Helper to check if user is allowed to use features
const checkModeration = async (ctx: BotContext, next: () => Promise<void>) => {
    if (ctx.user?.status === "PENDING") {
        return ctx.reply("⏳ Твій профіль на модерації. Дочекайся схвалення від Master Bot.");
    }
    if (ctx.user?.status === "REJECTED") {
        return ctx.reply("❌ Твій профіль не було схвалено. Звернуся до адміністратора.");
    }
    return next();
};

bot.hears("📸 Звіт", checkModeration, (ctx) => ctx.scene.enter("urban_guardian"));
bot.hears("🎒 Квести", checkModeration, (ctx) => ctx.scene.enter("logistics"));
bot.hears("🏆 Рейтинг", checkModeration, (ctx) => ctx.reply("🏆 **Рейтинг Скаутів**\n\nОберіть масштаб:", {
    parse_mode: "Markdown",
    ...Markup.inlineKeyboard([
        [Markup.button.callback("🌍 Загальний ТОП", "rating_global")],
        [Markup.button.callback("🏙️ Моє Місто", "rating_city"), Markup.button.callback("🏠 Мій Район", "rating_district")],
        [Markup.button.callback("🏫 Моя Школа", "rating_school")]
    ])
}));

// Action Handlers for Ratings
bot.action(/^rating_(.+)/, async (ctx) => {
    const type = ctx.match[1];
    const user = ctx.user;
    let filter = {};
    let title = "Загальний ТОП";

    if (type === "city") {
        filter = { city: user?.city };
        title = `ТОП Міста: ${user?.city || "Невідомо"}`;
    } else if (type === "district") {
        filter = { district: user?.district };
        title = `ТОП Району: ${user?.district || "Невідомо"}`;
    } else if (type === "school") {
        filter = { school: user?.school };
        title = `ТОП Школи: ${user?.school || "Невідомо"}`;
    }

    const top = await getLeaderboard(10, filter);
    let message = `🏆 <b>${title}</b>\n\n`;

    top.forEach((u: any, index: number) => {
        const medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤";
        const name = (u.firstName || u.username || "Анонім").replace(/</g, "&lt;").replace(/>/g, "&gt;");
        message += `${medal} ${name} — ${u.dignityScore} балів\n`;
    });

    if (top.length === 0) message = "📭 У цій категорії поки порожньо.";

    try {
        await ctx.editMessageText(message, {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard([[Markup.button.callback("⬅️ Назад", "rating_back")]])
        });
    } catch (e: any) {
        if (e.description?.includes("message is not modified")) return;
        console.error("[Rating Error]", e);
    }
    await ctx.answerCbQuery();
});

bot.action("rating_back", async (ctx) => {
    try {
        await ctx.editMessageText("🏆 **Рейтинг Скаутів**\n\nОбери масштаб рейтингу:", {
            parse_mode: "Markdown",
            ...Markup.inlineKeyboard([
                [Markup.button.callback("🌍 Загальний ТОП", "rating_global")],
                [Markup.button.callback("🏙️ Моє Місто", "rating_city"), Markup.button.callback("🏠 Мій Район", "rating_district")],
                [Markup.button.callback("🏫 Моя Школа", "rating_school")]
            ])
        });
    } catch (e: any) {
        if (e.description?.includes("message is not modified")) return;
        console.error(e);
    }
    await ctx.answerCbQuery();
});


bot.command("profile", (ctx) => {
    const user = ctx.user;
    ctx.reply(`👤 **Mein Profil** / **Мій Профіль**
    
🆔 ID: \`${user?.id.slice(0, 8)}\`
🏅 Status: ${user?.status}
🏆 Bewertung / Рейтинг: ${user?.dignityScore}
💰 Guthaben / Баланс: ${user?.balance || 0} EUR
🏙️ Stadt / Місто: ${user?.city || "Nicht festgelegt"}
🏠 Bezirk / Район: ${user?.district || "Nicht festgelegt"}
🏫 Schule / Школа: ${user?.school || "Nicht festgelegt"}

⚙️ **Einstellungen / Налаштування**
`, { 
        parse_mode: "Markdown", 
        ...Markup.inlineKeyboard([
            [Markup.button.callback("🌐 Sprache / Мова", "profile_language")],
            [Markup.button.callback("🔒 Datenschutz / Конфіденційність", "profile_privacy")],
            [Markup.button.callback("ℹ️ Über die App / Про додаток", "profile_about")],
            [Markup.button.callback("⬅️ Zurück / Назад", "profile_close")]
        ])
    });
});

bot.hears("👤 Профіль", (ctx) => {
    const user = ctx.user;
    ctx.reply(`👤 **Mein Profil** / **Мій Профіль**
    
🆔 ID: \`${user?.id.slice(0, 8)}\`
🏅 Status: ${user?.status}
🏆 Bewertung / Рейтинг: ${user?.dignityScore}
💰 Guthaben / Баланс: ${user?.balance || 0} EUR
🏙️ Stadt / Місто: ${user?.city || "Nicht festgelegt"}
🏠 Bezirk / Район: ${user?.district || "Nicht festgelegt"}
🏫 Schule / Школа: ${user?.school || "Nicht festgelegt"}

⚙️ **Einstellungen / Налаштування**
`, { 
        parse_mode: "Markdown", 
        ...Markup.inlineKeyboard([
            [Markup.button.callback("🌐 Sprache / Мова", "profile_language")],
            [Markup.button.callback("🔒 Datenschutz / Конфіденційність", "profile_privacy")],
            [Markup.button.callback("ℹ️ Über die App / Про додаток", "profile_about")],
            [Markup.button.callback("⬅️ Zurück / Назад", "profile_close")]
        ])
    });
});

bot.command('complete', async (ctx) => {
    try {
        const quest = await (prisma as any).quest.findFirst({
            where: {
                assigneeId: ctx.user?.id,
                status: 'IN_PROGRESS'
            },
            orderBy: { createdAt: 'desc' }
        });

        if (!quest) {
            await ctx.reply('Немає активного завдання для завершення.');
            return;
        }

        ctx.session.awaitingCompletionQuestId = quest.id;
        await ctx.reply(
            `📸 Надішліть фото-звіт для завдання:\n\n📝 ${quest.title}\n💰 ${quest.reward} EUR\n\nПісля перевірки батьками/клієнтом винагорода буде зарахована.`,
            { parse_mode: 'Markdown' }
        );
    } catch (error) {
        console.error('/complete error', error);
        await ctx.reply('❌ Не вдалося запустити завершення завдання.');
    }
});

bot.on('photo', async (ctx, next) => {
    try {
        const questId = ctx.session.awaitingCompletionQuestId;
        if (!questId) return next();

        const quest = await (prisma as any).quest.findUnique({
            where: { id: questId },
            include: {
                taskOrder: { select: { requesterId: true } }
            }
        });

        if (!quest || quest.assigneeId !== ctx.user?.id || quest.status !== 'IN_PROGRESS') {
            ctx.session.awaitingCompletionQuestId = undefined;
            await ctx.reply('❌ Завдання більше недоступне для завершення.');
            return;
        }

        const photos = ('photo' in ctx.message ? ctx.message.photo : []) || [];
        const lastPhoto = photos[photos.length - 1];
        if (!lastPhoto?.file_id) {
            await ctx.reply('❌ Фото не знайдено, спробуйте ще раз.');
            return;
        }

        const verifiers = await getQuestVerifiers(quest);
        const mustBeVerified = Boolean(quest.taskOrderId || quest.isPersonal) && !quest.autoApprove;

        if (mustBeVerified && verifiers.length > 0) {
            const completion = await (prisma as any).taskCompletion.create({
                data: {
                    questId,
                    studentId: ctx.user?.id,
                    photoTelegramId: lastPhoto.file_id,
                    status: 'PENDING'
                }
            });

            await (prisma as any).quest.update({
                where: { id: questId },
                data: { status: 'PENDING_VERIFICATION' }
            });

            await notifyCompletionSubmitted({
                completionId: completion.id,
                questTitle: quest.title,
                reward: Number(quest.reward),
                studentName: `${ctx.user?.firstName || ''} ${ctx.user?.lastName || ''}`.trim() || 'Студент',
                photoUrl: null,
                verifiers
            });

            await recordActivity(ctx.user?.id, 'QUEST_SUBMITTED_FOR_VERIFICATION', {
                questId,
                completionId: completion.id,
                source: 'telegram'
            });

            ctx.session.awaitingCompletionQuestId = undefined;
            await ctx.reply('✅ Фото-звіт надіслано. Очікуйте підтвердження від батьків/клієнта.');
            return;
        }

        await (prisma as any).$transaction(async (tx: any) => {
            await tx.quest.update({
                where: { id: questId },
                data: { status: 'COMPLETED' }
            });
            await tx.taskCompletion.create({
                data: {
                    questId,
                    studentId: ctx.user?.id,
                    photoTelegramId: lastPhoto.file_id,
                    status: 'APPROVED',
                    rewardAmount: Number(quest.reward),
                    rewardPaid: true,
                    verifiedById: ctx.user?.id,
                    verifiedAt: new Date()
                }
            });
            await tx.user.update({
                where: { id: ctx.user?.id },
                data: { balance: { increment: Number(quest.reward) } }
            });
        });

        await awardDignity(ctx.user?.id, 5);
        ctx.session.awaitingCompletionQuestId = undefined;
        await ctx.reply(`✅ Завдання завершено. Нараховано ${quest.reward} EUR.`);
    } catch (error) {
        console.error('photo completion error', error);
        await ctx.reply('❌ Не вдалося обробити фото-звіт.');
    }
});

bot.command('pending', async (ctx) => {
    try {
        const telegramId = BigInt(ctx.from.id);
        const user = await prisma.user.findUnique({
            where: { telegramId },
            select: { id: true }
        });

        if (!user) {
            await ctx.reply('Користувача не знайдено.');
            return;
        }

        const pending = await (prisma as any).taskCompletion.findMany({
            where: { status: 'PENDING' },
            include: {
                quest: { include: { taskOrder: true } },
                student: true
            },
            orderBy: { createdAt: 'desc' },
            take: 10
        });

        const allowed: any[] = [];
        for (const c of pending) {
            const isRequester = c.quest?.taskOrder?.requesterId === user.id;
            const parentRelation = c.quest?.assigneeId
                ? await (prisma as any).parentChild.findFirst({
                    where: {
                        parentId: user.id,
                        childId: c.quest.assigneeId,
                        status: 'APPROVED'
                    }
                })
                : null;
            if (isRequester || parentRelation) allowed.push(c);
        }

        if (allowed.length === 0) {
            await ctx.reply('✅ Немає звітів, що очікують вашого підтвердження.');
            return;
        }

        for (const c of allowed) {
            const caption =
                `📸 *Звіт на перевірку*\n\n` +
                `📝 ${c.quest.title}\n` +
                `👤 ${c.student?.firstName || ''} ${c.student?.lastName || ''}\n` +
                `💰 ${c.quest.reward} EUR`;

            const keyboard = Markup.inlineKeyboard([
                [Markup.button.callback('✅ Підтвердити', `approve_completion_${c.id}`)],
                [Markup.button.callback('❌ Відхилити', `reject_completion_${c.id}`)]
            ]);

            if (c.photoTelegramId) {
                await ctx.replyWithPhoto(c.photoTelegramId, {
                    caption,
                    parse_mode: 'Markdown',
                    ...keyboard
                });
            } else {
                await ctx.reply(caption, { parse_mode: 'Markdown', ...keyboard });
            }
        }
    } catch (error) {
        console.error('/pending error', error);
        await ctx.reply('❌ Не вдалося завантажити список підтверджень.');
    }
});

// Profile action handlers
bot.action("profile_language", async (ctx) => {
    await ctx.editMessageText(`🌐 **Sprache wählen / Оберіть мову**\n\nWählen Sie Ihre bevorzugte Sprache:`, {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([
            [Markup.button.callback("🇩🇪 Deutsch", "lang_de"), Markup.button.callback("🇺🇸 English", "lang_en")],
            [Markup.button.callback("🇺🇦 Українська", "lang_uk"), Markup.button.callback("🇷🇺 Русский", "lang_ru")],
            [Markup.button.callback("🇫🇷 Français", "lang_fr")],
            [Markup.button.callback("⬅️ Zurück / Назад", "profile_back")]
        ])
    });
    await ctx.answerCbQuery();
});

bot.action(/^lang_(.+)/, async (ctx) => {
    const lang = ctx.match[1];
    const langNames: Record<string, string> = {
        de: "🇩🇪 Deutsch",
        en: "🇺🇸 English",
        uk: "🇺🇦 Українська",
        ru: "🇷🇺 Русский",
        fr: "🇫🇷 Français"
    };
    
    // TODO: Save language preference to database
    await ctx.editMessageText(`✅ Sprache geändert zu: ${langNames[lang]}\n\n*Hinweis: Spracheinstellungen werden in der nächsten Version gespeichert.*`, {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([[Markup.button.callback("⬅️ Zurück", "profile_back")]])
    });
    await ctx.answerCbQuery(`Sprache: ${langNames[lang]}`);
});

bot.action("profile_privacy", async (ctx) => {
    const privacyText = `🔒 **Datenschutzerklärung (DSGVO)**

**1. Verantwortlicher**
GenTrust Mobility GmbH
Hauptstraße 123, 10115 Berlin
E-Mail: datenschutz@gentrust.de

**2. Datenverarbeitung**
Wir verarbeiten personenbezogene Daten gemäß Art. 6 Abs. 1 DSGVO:
• Name, Telegram-ID (Vertragserfüllung)
• Standortdaten (mit Ihrer Einwilligung)
• Nutzungsstatistiken (berechtigtes Interesse)

**3. Ihre Rechte**
Sie haben das Recht auf:
• Auskunft (Art. 15 DSGVO)
• Berichtigung (Art. 16 DSGVO)
• Löschung (Art. 17 DSGVO)
• Widerspruch (Art. 21 DSGVO)

**4. Datensicherheit**
Wir verwenden SSL-Verschlüsselung und moderne Sicherheitsstandards.

**5. Kontakt**
datenschutz@gentrust.de

Stand: Februar 2026`;

    await ctx.editMessageText(privacyText, {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([[Markup.button.callback("⬅️ Zurück / Назад", "profile_back")]])
    });
    await ctx.answerCbQuery();
});

bot.action("profile_about", async (ctx) => {
    await ctx.editMessageText(`ℹ️ **Über GenTrust Mobility**

**Version:** 1.0.0 Beta
**Platform:** Telegram Bot + Mobile Apps

**Funktionen:**
🌍 Urban Guardian - Problemberichterstattung
🎒 Quests - Logistikaufgaben
🏆 Bewertungssystem - Dignity Score
💰 Belohnungen - EUR-Guthaben

**Support:**
📧 support@gentrust.de
🌐 www.gentrust.de

© 2026 GenTrust Mobility GmbH`, {
        parse_mode: "Markdown",
        ...Markup.inlineKeyboard([[Markup.button.callback("⬅️ Zurück / Назад", "profile_back")]])
    });
    await ctx.answerCbQuery();
});

bot.action("profile_back", async (ctx) => {
    const user = ctx.user;
    await ctx.editMessageText(`👤 **Mein Profil** / **Мій Профіль**
    
🆔 ID: \`${user?.id.slice(0, 8)}\`
🏅 Status: ${user?.status}
🏆 Bewertung / Рейтинг: ${user?.dignityScore}
💰 Guthaben / Баланс: ${user?.balance || 0} EUR
🏙️ Stadt / Місто: ${user?.city || "Nicht festgelegt"}
🏠 Bezirk / Район: ${user?.district || "Nicht festgelegt"}
🏫 Schule / Школа: ${user?.school || "Nicht festgelegt"}

⚙️ **Einstellungen / Налаштування**
`, { 
        parse_mode: "Markdown", 
        ...Markup.inlineKeyboard([
            [Markup.button.callback("🌐 Sprache / Мова", "profile_language")],
            [Markup.button.callback("🔒 Datenschutz / Конфіденційність", "profile_privacy")],
            [Markup.button.callback("ℹ️ Über die App / Про додаток", "profile_about")],
            [Markup.button.callback("⬅️ Zurück / Назад", "profile_close")]
        ])
    });
    await ctx.answerCbQuery();
});

bot.action("profile_close", async (ctx) => {
    await ctx.deleteMessage();
    await ctx.answerCbQuery("Profil geschlossen");
});

// Completion verification actions (for parents/clients)
bot.action(/^approve_completion_(.+)/, async (ctx) => {
    try {
        const completionId = ctx.match[1];
        const telegramId = BigInt(ctx.from.id);

        const approver = await prisma.user.findUnique({
            where: { telegramId },
            select: { id: true, role: true }
        });

        if (!approver) {
            await ctx.answerCbQuery('Користувач не знайдений', { show_alert: true });
            return;
        }

        const completion = await (prisma as any).taskCompletion.findUnique({
            where: { id: completionId },
            include: {
                quest: { include: { taskOrder: true } },
                student: true
            }
        });

        if (!completion || completion.status !== 'PENDING') {
            await ctx.answerCbQuery('Звіт уже оброблено', { show_alert: true });
            return;
        }

        const isRequester = completion.quest?.taskOrder?.requesterId === approver.id;
        const parentRelation = completion.quest?.assigneeId
            ? await (prisma as any).parentChild.findFirst({
                where: {
                    parentId: approver.id,
                    childId: completion.quest.assigneeId,
                    status: 'APPROVED'
                }
            })
            : null;

        const canApprove = approver.role === 'ADMIN' || isRequester || !!parentRelation;
        if (!canApprove) {
            await ctx.answerCbQuery('Немає доступу', { show_alert: true });
            return;
        }

        await (prisma as any).$transaction(async (tx: any) => {
            await tx.taskCompletion.update({
                where: { id: completionId },
                data: {
                    status: 'APPROVED',
                    verifiedById: approver.id,
                    verifiedAt: new Date(),
                    rewardAmount: Number(completion.quest.reward),
                    rewardPaid: true
                }
            });

            await tx.user.update({
                where: { id: completion.studentId },
                data: { balance: { increment: Number(completion.quest.reward) } }
            });

            await tx.quest.update({
                where: { id: completion.questId },
                data: { status: 'COMPLETED' }
            });
        });

        await awardDignity(completion.studentId, 5);

        if (completion.student?.telegramId) {
            await bot.telegram.sendMessage(Number(completion.student.telegramId),
                `✅ Ваш фото-звіт підтверджено!\n\n📝 ${completion.quest.title}\n💰 +${completion.quest.reward} EUR`,
                { parse_mode: 'Markdown' }
            );
        }

        await ctx.editMessageCaption?.(`✅ Підтверджено\n\n📝 ${completion.quest.title}\n💰 ${completion.quest.reward} EUR`);
        await ctx.answerCbQuery('Підтверджено');
    } catch (error) {
        console.error('approve_completion error:', error);
        await ctx.answerCbQuery('Помилка підтвердження', { show_alert: true });
    }
});

bot.action(/^reject_completion_(.+)/, async (ctx) => {
    try {
        const completionId = ctx.match[1];
        const telegramId = BigInt(ctx.from.id);

        const approver = await prisma.user.findUnique({
            where: { telegramId },
            select: { id: true, role: true }
        });

        if (!approver) {
            await ctx.answerCbQuery('Користувач не знайдений', { show_alert: true });
            return;
        }

        const completion = await (prisma as any).taskCompletion.findUnique({
            where: { id: completionId },
            include: {
                quest: { include: { taskOrder: true } },
                student: true
            }
        });

        if (!completion || completion.status !== 'PENDING') {
            await ctx.answerCbQuery('Звіт уже оброблено', { show_alert: true });
            return;
        }

        const isRequester = completion.quest?.taskOrder?.requesterId === approver.id;
        const parentRelation = completion.quest?.assigneeId
            ? await (prisma as any).parentChild.findFirst({
                where: {
                    parentId: approver.id,
                    childId: completion.quest.assigneeId,
                    status: 'APPROVED'
                }
            })
            : null;

        const canReject = approver.role === 'ADMIN' || isRequester || !!parentRelation;
        if (!canReject) {
            await ctx.answerCbQuery('Немає доступу', { show_alert: true });
            return;
        }

        await (prisma as any).$transaction(async (tx: any) => {
            await tx.taskCompletion.update({
                where: { id: completionId },
                data: {
                    status: 'REJECTED',
                    verifiedById: approver.id,
                    verifiedAt: new Date(),
                    rejectionReason: 'Відхилено через Telegram'
                }
            });

            await tx.quest.update({
                where: { id: completion.questId },
                data: { status: 'IN_PROGRESS' }
            });
        });

        if (completion.student?.telegramId) {
            await bot.telegram.sendMessage(Number(completion.student.telegramId),
                `❌ Ваш фото-звіт відхилено.\n\n📝 ${completion.quest.title}\n📝 Причина: Відхилено замовником`,
                { parse_mode: 'Markdown' }
            );
        }

        await ctx.editMessageCaption?.(`❌ Відхилено\n\n📝 ${completion.quest.title}`);
        await ctx.answerCbQuery('Відхилено');
    } catch (error) {
        console.error('reject_completion error:', error);
        await ctx.answerCbQuery('Помилка відхилення', { show_alert: true });
    }
});

// JSON serializer for BigInt (Prisma uses BigInt for BigInt fields)
// @ts-ignore
BigInt.prototype.toJSON = function () { return this.toString() }

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
