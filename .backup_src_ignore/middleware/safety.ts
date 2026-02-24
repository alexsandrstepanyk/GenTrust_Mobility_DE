import { Middleware } from "telegraf";
import { BotContext } from "./auth";

const START_HOUR = 8;
const END_HOUR = 20;

export const safetyMiddleware: Middleware<BotContext> = async (ctx, next) => {
    const now = new Date();
    const currentHour = now.getHours();

    console.log(`[Safety] Time Check: ${now.toLocaleString()} (Hour: ${currentHour})`);

    if (currentHour < START_HOUR || currentHour >= END_HOUR) {
        console.log(`[Safety] Outside working hours (8-20). Blocking non-admin.`);
        // Check if user is trying to do a quest or report (simplified check)
        // For MVP, we'll just check if it's a message that isn't /start or /profile
        if (ctx.message && "text" in ctx.message) {
            const text = ctx.message.text;
            if (text.startsWith("/start") || text.startsWith("/profile")) {
                console.log(`[Safety] Allowing basic command: ${text}`);
                return next();
            }
        }

        // Allow non-quest actions, blocking main mechanics
        // But since we are using scenes, we might want to block entry to scenes
        // For this prototype, let's just warn them if they aren't admin.
        if (ctx.user?.role !== "ADMIN") {
            await ctx.reply("🌙 Safety Guard: Робота скаута дозволена лише з 08:00 до 20:00. Відпочивай!");
            return; // Stop execution
        }
    }

    return next();
};
