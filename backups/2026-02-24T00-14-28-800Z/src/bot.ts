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
    ctx.reply(`👤 **Мій Профіль Скаута**
    
🆔 ID: \`${ctx.user?.id.slice(0, 8)}\`
🏅 Статус: ${ctx.user?.status}
🏆 Рейтинг: ${ctx.user?.dignityScore}
🏙️ Місто: ${ctx.user?.city || "Не визначено"}
🏠 Район: ${ctx.user?.district || "Не визначено"}
🏫 Школа: ${ctx.user?.school || "Не визначено"}
`, { parse_mode: "Markdown", ...mainMenu });
});
bot.hears("👤 Профіль", (ctx) => {
    ctx.reply(`👤 **Мій Профіль Скаута**
    
🆔 ID: \`${ctx.user?.id.slice(0, 8)}\`
🏅 Статус: ${ctx.user?.status}
🏆 Рейтинг: ${ctx.user?.dignityScore}
🏙️ Місто: ${ctx.user?.city || "Не визначено"}
🏠 Район: ${ctx.user?.district || "Не визначено"}
🏫 Школа: ${ctx.user?.school || "Не визначено"}
`, { parse_mode: "Markdown", ...mainMenu });
});

// JSON serializer for BigInt (Prisma uses BigInt for BigInt fields)
// @ts-ignore
BigInt.prototype.toJSON = function () { return this.toString() }

// Graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));

export default bot;
