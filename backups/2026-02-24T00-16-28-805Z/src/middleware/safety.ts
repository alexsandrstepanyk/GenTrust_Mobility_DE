import { Middleware } from "telegraf";
import { BotContext } from "./auth";

const START_HOUR = Number(process.env.SAFETY_START_HOUR ?? 8);
const END_HOUR = Number(process.env.SAFETY_END_HOUR ?? 21);
const SAFETY_ENABLED = (process.env.SAFETY_GUARD ?? "true") === "true";
const ADMIN_USER_ID = process.env.ADMIN_USER_ID;

export const safetyMiddleware: Middleware<BotContext> = async (ctx, next) => {
    if (!SAFETY_ENABLED) {
        return next();
    }

    const now = new Date();
    const currentHour = now.getHours();

    console.log(`[Safety] Time Check: ${now.toLocaleString()} (Hour: ${currentHour})`);

    if (currentHour < START_HOUR || currentHour >= END_HOUR) {
        console.log(`[Safety] Outside working hours (8-20). Blocking actions.`);
        const isAdmin = ctx.user?.role === "ADMIN" || (ADMIN_USER_ID && ctx.user?.id === ADMIN_USER_ID);
        if (isAdmin) {
            return next();
        }

        await ctx.reply("🌙 Зараз не робочі години. Будь ласка, спробуйте знову з 08:00 до 20:00.");
        return; // Stop execution
    }

    return next();
};
