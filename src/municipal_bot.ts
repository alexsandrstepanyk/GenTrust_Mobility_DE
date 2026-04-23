import { Telegraf, Context, Markup, session, Scenes } from "telegraf";
import * as dotenv from "dotenv";
import prisma from "./services/prisma";
import { municipalOnboardingScene } from "./scenes/municipal_onboarding";
import axios from "axios";
import { messengerHub } from "./services/messenger";
import { recordActivity } from "./services/life_recorder";

dotenv.config();

const token = process.env.MUNICIPAL_BOT_TOKEN;
const scoutToken = process.env.BOT_TOKEN;
if (!token) {
    console.warn("[Municipal Bot] MUNICIPAL_BOT_TOKEN not found in .env. Municipal Bot disabled.");
}

export const municipalBot = token ? new Telegraf<Scenes.SceneContext>(token) : null;

// Hauptmenü
export const getMunicipalMenu = (lang: string = 'de') => {
    if (lang === 'uk') {
        return Markup.keyboard([
            ["📋 Мої завдання", "✅ Виконано"],
            ["📊 Статистика", "👤 Профіль"],
            ["❌ Скасувати"]
        ]).resize();
    }
    return Markup.keyboard([
        ["📋 Meine Aufgaben", "✅ Erledigt"],
        ["📊 Statistik", "👤 Profil"],
        ["❌ Abbrechen"]
    ]).resize();
};

const mainMenu = getMunicipalMenu('de');

if (municipalBot) {
    // Middleware
    municipalBot.use(session());
    // @ts-ignore
    const stage = new Scenes.Stage([municipalOnboardingScene]);
    const menuTriggers = new Set([
        "📋 Meine Aufgaben",
        "✅ Erledigt",
        "📊 Statistik",
        "👤 Profil",
        "❌ Abbrechen",
        "/start"
    ]);

    municipalBot.use(async (ctx, next) => {
        if (ctx.message && "text" in ctx.message) {
            const text = ctx.message.text;
            if (text.startsWith("/") || menuTriggers.has(text)) {
                try { await (ctx as any).scene.leave(); } catch (e) { }
            }
        }
        return next();
    });
    // @ts-ignore
    municipalBot.use(stage.middleware());

    // Middleware für Registrierungsprüfung
    const checkRegistration = async (ctx: Context, next: () => Promise<void>) => {
        if (!ctx.from) return;

        const worker = await (prisma as any).municipalWorker.findUnique({
            where: { telegramId: BigInt(ctx.from.id) }
        });

        if (!worker || worker.status !== "ACTIVE") {
            return ctx.reply("⚠️ Sie sind nicht registriert oder Ihr Konto wurde noch nicht genehmigt.\n\nVerwenden Sie /start zur Registrierung.");
        }

        (ctx as any).worker = worker;
        return next();
    };

    // Befehl /start
    municipalBot.start(async (ctx) => {
        const worker = await (prisma as any).municipalWorker.findUnique({
            where: { telegramId: BigInt(ctx.from!.id) }
        });

        if (!worker) {
            return (ctx as any).scene.enter("municipal_onboarding");
        }

        if (worker.status !== "ACTIVE") {
            return ctx.reply("⏳ Ваш запит на реєстрацію ще на розгляді. Ми повідомимо вас після підтвердження.");
        }

        return ctx.reply(`Willkommen zurück, ${worker.firstName}!`, getMunicipalMenu());
    });

    // --- TASK MANAGEMENT ---

    municipalBot.hears("📋 Meine Aufgaben", checkRegistration, async (ctx) => {
        const worker = (ctx as any).worker;
        const tasks = await (prisma as any).municipalTask.findMany({
            where: { 
                workerId: worker.id,
                status: "OPEN"
            },
            include: { report: true }
        });

        if (tasks.length === 0) {
            return ctx.reply("У вас немає відкритих завдань.");
        }

        for (const task of tasks) {
            await ctx.reply(`📍 ${task.report.category}\n📝 ${task.report.description || 'Keine Beschreibung'}\n\nКоординати: ${task.report.latitude}, ${task.report.longitude}`, 
                Markup.inlineKeyboard([
                    [Markup.button.callback("✅ Erledigt", `complete_task_${task.id}`)],
                    [Markup.button.callback("⚠️ Problem", `no_issue_task_${task.id}`)]
                ]));
        }
    });

    municipalBot.action(/^complete_task_(.+)/, checkRegistration, async (ctx) => {
        const taskId = ctx.match[1];
        (ctx.session as any).pendingCompletionTaskId = taskId;
        (ctx.session as any).pendingCompletionAction = "DONE";
        
        await ctx.answerCbQuery();
        await ctx.reply("📸 Bitte senden Sie ein Foto der erledigten Aufgabe.");
    });

    municipalBot.on("photo", checkRegistration, async (ctx) => {
        const taskId = (ctx.session as any).pendingCompletionTaskId;
        if (!taskId) return;

        const photo = ctx.message.photo.pop();
        if (!photo) return;

        const completionPhotoId = photo.file_id;

        await (prisma as any).municipalTask.update({
            where: { id: taskId },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                completionResult: "DONE",
                completionPhotoId: completionPhotoId || null
            }
        });

        (ctx.session as any).pendingCompletionTaskId = null;
        (ctx.session as any).pendingCompletionAction = null;

        await ctx.reply("✅ Danke! Foto erhalten, Aufgabe geschlossen.", mainMenu);
    });

    municipalBot.action(/^no_issue_task_(.+)/, checkRegistration, async (ctx) => {
        const taskId = ctx.match[1];

        try {
            const task = await (prisma as any).municipalTask.update({
                where: { id: taskId },
                data: {
                    status: "COMPLETED",
                    completedAt: new Date(),
                    completionResult: "NO_ISSUE",
                }
            });

            await ctx.answerCbQuery("Aufgabe als NO_ISSUE geschlossen.");
            await ctx.editMessageText("✅ Aufgabe wurde als 'Kein Problem gefunden' geschlossen.");
        } catch (error) {
            console.error("Error closing task:", error);
            ctx.answerCbQuery("Error.");
        }
    });

    console.log("✅ Municipal Bot logic loaded.");
}
