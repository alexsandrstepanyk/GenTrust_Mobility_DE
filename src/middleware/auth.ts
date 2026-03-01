import { Context, Middleware, Scenes } from "telegraf";
import prisma from "../services/prisma";

// Custom fields on the session
interface MySessionData {
    // Onboarding data
    onboarding?: {
        firstName?: string;
        lastName?: string;
        birthDate?: string;
        school?: string;
        grade?: string;
        city?: string;
        district?: string;
    };
    reportData?: {
        photoId: string;
        aiVerdict: string;
        lastImageBase64?: string; // Cache for retry with description
        description?: string; // Manual override description
        category?: string; // Selected category
    };
    activeQuest?: {
        id: string;
        title?: string;
        reward: number;
        pickupCode: string;   // Code to show merchant
        deliveryCode: string; // Code to receive from recipient
    };
    awaitingCompletionQuestId?: string;
}

// Combine with Wizard session structure
export interface SessionData extends Scenes.WizardSession<Scenes.WizardSessionData>, MySessionData { }

export interface BotContext extends Scenes.WizardContext<Scenes.WizardSessionData> {
    session: SessionData;
    user?: any;
}

export const authMiddleware: Middleware<BotContext> = async (ctx, next) => {
    const telegramUser = ctx.from;
    if (!telegramUser) return next();

    try {
        console.log(`[Auth] Processing user: ${telegramUser.id} (${telegramUser.username})`);
        let user = await prisma.user.findUnique({
            where: { telegramId: BigInt(telegramUser.id) },
        });

        if (!user) {
            console.log(`[Auth] New user detected. Creating...`);
            user = await prisma.user.create({
                data: {
                    telegramId: BigInt(telegramUser.id),
                    username: telegramUser.username || "",
                    role: "SCOUT",
                    status: "PENDING",
                },
            });
            console.log(`[Auth] User created: ${user.id}`);
        } else {
            console.log(`[Auth] User found: ${user.id} (${user.role})`);
        }

        ctx.user = user;
        return next();
    } catch (error) {
        console.error("[Auth] Database Error:", error);
        // Reply to user if possible, so they know it's broken
        if (ctx.chat) {
            await ctx.reply("⚠️ System Error: Database connection failed.");
        }
        return; // Stop checking middleware
    }
};
