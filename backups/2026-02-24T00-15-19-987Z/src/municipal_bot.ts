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
    console.error("[Municipal Bot] MUNICIPAL_BOT_TOKEN not found in .env");
    process.exit(1);
}

export const municipalBot = new Telegraf<Scenes.SceneContext>(token);

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

// Hauptmenü
const mainMenu = Markup.keyboard([
    ["📋 Meine Aufgaben", "✅ Erledigt"],
    ["📊 Statistik", "👤 Profil"],
    ["❌ Abbrechen"]
]).resize();

// Befehl /start
municipalBot.start(async (ctx) => {
    const worker = await (prisma as any).municipalWorker.findUnique({
        where: { telegramId: BigInt(ctx.from!.id) }
    });

    if (worker) {
        if (worker.status === "PENDING") {
            return ctx.reply("⏳ Ihre Bewerbung wird geprüft. Warten Sie auf die Genehmigung durch den Administrator.");
        } else if (worker.status === "ACTIVE") {
            return ctx.reply(`Willkommen, ${worker.firstName}! 👋\n\nSie sind bereits im Kommunaldienstsystem registriert.`, mainMenu);
        } else if (worker.status === "BLOCKED") {
            return ctx.reply("🚫 Ihr Konto wurde gesperrt. Wenden Sie sich an den Administrator.");
        }
    }

    // Neuer Benutzer - Onboarding starten
    await ctx.reply("Willkommen im Kommunaldienstsystem! 🏗️\n\nUm mit der Arbeit zu beginnen, müssen Sie sich registrieren.");
    return (ctx as any).scene.enter("municipal_onboarding");
});

municipalBot.hears("❌ Abbrechen", async (ctx) => {
    try { await (ctx as any).scene.leave(); } catch (e) { }
    await ctx.reply("Zurück zum Hauptmenü.", mainMenu);
});

// Konto-Diagnose
municipalBot.command("whoami", async (ctx) => {
    const telegramId = ctx.from?.id;
    if (!telegramId) return ctx.reply("❌ Telegram ID konnte nicht ermittelt werden.");

    const worker = await (prisma as any).municipalWorker.findUnique({
        where: { telegramId: BigInt(telegramId) }
    });

    if (!worker) {
        return ctx.reply(
            `🆔 Ihre Telegram ID: ${telegramId}\n\n✅ Sie sind noch nicht registriert. Verwenden Sie /start zur Registrierung.`
        );
    }

    return ctx.reply(
        `🆔 Ihre Telegram ID: ${telegramId}\n` +
        `👤 Name: ${worker.firstName || "—"} ${worker.lastName || ""}\n` +
        `🏢 Abteilung: ${worker.department || "—"}\n` +
        `📌 Status: ${worker.status}\n\n` +
        (worker.status === "ACTIVE"
            ? "✅ Konto aktiv. Verwenden Sie /start oder die Menü-Tasten."
            : "⏳ Warten Sie auf die Genehmigung oder wenden Sie sich an den Administrator.")
    );
});

// Button "Meine Aufgaben"
municipalBot.hears("📋 Meine Aufgaben", checkRegistration, async (ctx) => {
    const worker = (ctx as any).worker;

    const tasks = await (prisma as any).municipalTask.findMany({
        where: {
            OR: [
                { workerId: worker.id },
                { workerId: null, status: "OPEN" }
            ],
            status: { in: ["OPEN", "IN_PROGRESS"] }
        },
        include: {
            report: {
                include: {
                    author: true
                }
            }
        },
        orderBy: [
            { priority: "desc" },
            { createdAt: "asc" }
        ]
    });

    if (tasks.length === 0) {
        return ctx.reply("📭 Derzeit keine aktiven Aufgaben.", mainMenu);
    }

    let message = `📋 <b>Aktive Aufgaben (${tasks.length})</b>\n\n`;

    for (const task of tasks) {
        const priorityEmoji: { [key: string]: string } = {
            "URGENT": "🚨",
            "HIGH": "⚠️",
            "MEDIUM": "📌",
            "LOW": "ℹ️"
        };
        const emoji = priorityEmoji[task.priority] || "📌";

        const statusText = task.status === "IN_PROGRESS" ? "🔄 In Arbeit" : "🆕 Neu";

        message += `${emoji} <b>${task.report.category || "Problem"}</b>\n`;
        message += `${statusText}\n`;
        message += `📍 Koordinaten: ${task.report.latitude.toFixed(5)}, ${task.report.longitude.toFixed(5)}\n`;
        if (task.report.description) {
            message += `📝 ${task.report.description}\n`;
        }
        message += `\n`;
    }

    await ctx.reply(message, {
        parse_mode: "HTML",
        ...Markup.inlineKeyboard(
            tasks.slice(0, 5).map((task: any) => [
                Markup.button.callback(
                    `${task.status === "IN_PROGRESS" ? "🔄" : "👁️"} ${task.report.category || "Aufgabe"}`,
                    `view_task_${task.id}`
                )
            ])
        )
    });
});

// Einzelaufgabe anzeigen
municipalBot.action(/^view_task_(.+)/, checkRegistration, async (ctx) => {
    const taskId = ctx.match[1];
    const worker = (ctx as any).worker;

    const task = await (prisma as any).municipalTask.findUnique({
        where: { id: taskId },
        include: {
            report: {
                include: {
                    author: true
                }
            },
            assignedTo: true
        }
    });

    if (!task) {
        return ctx.answerCbQuery("❌ Aufgabe nicht gefunden");
    }

    const priorityMap: { [key: string]: string } = {
        "URGENT": "🚨 DRINGEND",
        "HIGH": "⚠️ HOHE PRIORITÄT",
        "MEDIUM": "📌 MITTLERE PRIORITÄT",
        "LOW": "ℹ️ NIEDRIGE PRIORITÄT"
    };
    const priorityEmoji = priorityMap[task.priority] || "📌";

    let message = `${priorityEmoji}\n\n`;
    message += `📍 <b>Standort:</b>\n`;
    message += `Koordinaten: ${task.report.latitude.toFixed(6)}, ${task.report.longitude.toFixed(6)}\n\n`;
    message += `🗂️ <b>Kategorie:</b> ${task.report.category || "Nicht angegeben"}\n`;

    if (task.report.description) {
        message += `📝 <b>Beschreibung:</b> ${task.report.description}\n`;
    }

    message += `\n📅 <b>Erstellt:</b> ${new Date(task.createdAt).toLocaleString("de-DE")}\n`;

    if (task.assignedTo) {
        message += `👤 <b>Zugewiesen an:</b> ${task.assignedTo.firstName} ${task.assignedTo.lastName || ""}\n`;
    }

    message += `\n📊 <b>Status:</b> ${task.status === "IN_PROGRESS" ? "🔄 In Arbeit" : "🆕 Offen"}\n`;

    const buttons = [];

    if (task.status === "OPEN" && !task.workerId) {
        buttons.push([Markup.button.callback("✅ Aufgabe annehmen", `accept_task_${task.id}`)]);
    } else if (task.workerId === worker.id && task.status === "IN_PROGRESS") {
        buttons.push([Markup.button.callback("📸 Aufgabe erledigt (Foto)", `complete_task_${task.id}`)]);
        buttons.push([Markup.button.callback("🚫 Kein Problem", `no_issue_task_${task.id}`)]);
        buttons.push([Markup.button.callback("⚠️ Unmöglich auszuführen", `impossible_task_${task.id}`)]);
        buttons.push([Markup.button.callback("❌ Abbrechen", `cancel_task_${task.id}`)]);
    }

    buttons.push([Markup.button.callback("🗺️ Auf Karte anzeigen", `map_task_${task.id}`)]);
    buttons.push([Markup.button.callback("⬅️ Zurück", "back_to_tasks")]);

    try {
        // Versuch: Foto über Scout Bot laden, da file_id nicht zwischen Bots geteilt wird
        if (scoutToken && task.report.photoId) {
            const fileResp = await axios.get(`https://api.telegram.org/bot${scoutToken}/getFile`, {
                params: { file_id: task.report.photoId }
            });
            const filePath = fileResp.data?.result?.file_path;

            if (filePath) {
                const fileUrl = `https://api.telegram.org/file/bot${scoutToken}/${filePath}`;
                const imgResp = await axios.get(fileUrl, { responseType: "arraybuffer" });
                const buffer = Buffer.from(imgResp.data, "binary");

                await ctx.replyWithPhoto({ source: buffer }, {
                    caption: message,
                    parse_mode: "HTML",
                    ...Markup.inlineKeyboard(buttons)
                });
                await ctx.answerCbQuery();
                return;
            }
        }

        // Fallback: ohne Foto
        await ctx.reply(message, {
            parse_mode: "HTML",
            ...Markup.inlineKeyboard(buttons)
        });
        await ctx.answerCbQuery();
    } catch (e) {
        try {
            await ctx.editMessageText(message, {
                parse_mode: "HTML",
                ...Markup.inlineKeyboard(buttons)
            });
        } catch (err) {
            await ctx.reply(message, {
                parse_mode: "HTML",
                ...Markup.inlineKeyboard(buttons)
            });
        }
        await ctx.answerCbQuery();
    }
});

// Aufgabe annehmen
municipalBot.action(/^accept_task_(.+)/, checkRegistration, async (ctx) => {
    const taskId = ctx.match[1];
    const worker = (ctx as any).worker;

    const task = await (prisma as any).municipalTask.update({
        where: { id: taskId },
        data: {
            workerId: worker.id,
            status: "IN_PROGRESS"
        }
    });

    await ctx.answerCbQuery("✅ Aufgabe angenommen!");
    await ctx.editMessageReplyMarkup({
        inline_keyboard: [
            [{ text: "📸 Aufgabe erledigt (Foto)", callback_data: `complete_task_${task.id}` }],
            [{ text: "🚫 Kein Problem", callback_data: `no_issue_task_${task.id}` }],
            [{ text: "⚠️ Unmöglich auszuführen", callback_data: `impossible_task_${task.id}` }],
            [{ text: "❌ Abbrechen", callback_data: `cancel_task_${task.id}` }],
            [{ text: "⬅️ Zurück", callback_data: "back_to_tasks" }]
        ]
    });
});

// Aufgabe erledigen
municipalBot.action(/^complete_task_(.+)/, checkRegistration, async (ctx) => {
    const taskId = ctx.match[1];
    (ctx.session as any).pendingCompletionTaskId = taskId;
    (ctx.session as any).pendingCompletionAction = "DONE";

    await ctx.answerCbQuery();
    await ctx.reply("📸 Senden Sie ein Foto der erledigten Aufgabe zur Bestätigung.");
});

municipalBot.on("photo", checkRegistration, async (ctx) => {
    const pendingTaskId = (ctx.session as any).pendingCompletionTaskId;
    const pendingAction = (ctx.session as any).pendingCompletionAction;

    if (!pendingTaskId || pendingAction !== "DONE") return;

    const photos = (ctx.message as any).photo || [];
    const photo = photos[photos.length - 1];
    const completionPhotoId = photo?.file_id;

    await (prisma as any).municipalTask.update({
        where: { id: pendingTaskId },
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
                completionResult: "NO_ISSUE"
            },
            include: { report: { include: { author: true } } }
        });

        // Penalize scout: double penalty and 7-day ban
        const banUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        await prisma.user.update({
            where: { id: task.report.authorId },
            data: {
                dignityScore: { decrement: 10 },
                urbanBanExpiresAt: banUntil
            }
        });

        await prisma.report.update({
            where: { id: task.reportId },
            data: { status: "REJECTED" }
        });

        await recordActivity(task.report.authorId, "REPORT_REJECTED", { reportId: task.reportId, reason: "NO_ISSUE" } as any);

        await messengerHub.sendToScout(task.report.author.telegramId,
            "❌ Der Kommunaldienst hat kein Problem gefunden.\n\n📉 Bewertung reduziert (-10).\n🚫 Zugang zu Berichten für 7 Tage gesperrt.");

        await ctx.answerCbQuery("Markiert: kein Problem");
        await ctx.reply("✅ Bericht als 'Kein Problem' geschlossen.", mainMenu);
    } catch (e) {
        console.error(e);
        await ctx.answerCbQuery("Fehler");
    }
});

municipalBot.action(/^impossible_task_(.+)/, checkRegistration, async (ctx) => {
    const taskId = ctx.match[1];

    try {
        await (prisma as any).municipalTask.update({
            where: { id: taskId },
            data: {
                status: "COMPLETED",
                completedAt: new Date(),
                completionResult: "IMPOSSIBLE"
            }
        });

        await ctx.answerCbQuery("Als unmöglich markiert");
        await ctx.reply("⚠️ Aufgabe als unmöglich auszuführen markiert.", mainMenu);
    } catch (e) {
        console.error(e);
        await ctx.answerCbQuery("Fehler");
    }
});

// Aufgabe abbrechen
municipalBot.action(/^cancel_task_(.+)/, checkRegistration, async (ctx) => {
    const taskId = ctx.match[1];

    await (prisma as any).municipalTask.update({
        where: { id: taskId },
        data: {
            workerId: null,
            status: "OPEN"
        }
    });

    await ctx.answerCbQuery("Aufgabe abgebrochen");
    await ctx.reply("❌ Aufgabe in allgemeine Liste zurückgegeben.", mainMenu);
});

// Auf Karte anzeigen
municipalBot.action(/^map_task_(.+)/, async (ctx) => {
    const taskId = ctx.match[1];

    const task = await (prisma as any).municipalTask.findUnique({
        where: { id: taskId },
        include: { report: true }
    });

    if (!task) {
        return ctx.answerCbQuery("❌ Aufgabe nicht gefunden");
    }

    await ctx.replyWithLocation(task.report.latitude, task.report.longitude);
    await ctx.answerCbQuery();
});

// Zurück zur Aufgabenliste
municipalBot.action("back_to_tasks", async (ctx) => {
    await ctx.answerCbQuery();
    await ctx.deleteMessage();
    // Simuliere das Drücken der Taste "Meine Aufgaben"
    (ctx as any).message = { text: "📋 Meine Aufgaben" };
    return municipalBot.hears("📋 Meine Aufgaben", checkRegistration, async () => { });
});

// Erledigte Aufgaben
municipalBot.hears("✅ Erledigt", checkRegistration, async (ctx) => {
    const worker = (ctx as any).worker;

    const completedTasks = await (prisma as any).municipalTask.findMany({
        where: {
            workerId: worker.id,
            status: "COMPLETED"
        },
        include: {
            report: true
        },
        orderBy: {
            completedAt: "desc"
        },
        take: 10
    });

    if (completedTasks.length === 0) {
        return ctx.reply("📭 Sie haben noch keine Aufgabe erledigt.", mainMenu);
    }

    let message = `✅ <b>Erledigte Aufgaben (${completedTasks.length})</b>\n\n`;

    completedTasks.forEach((task: any) => {
        message += `✔️ ${task.report.category || "Aufgabe"}\n`;
        message += `📅 Erledigt: ${new Date(task.completedAt).toLocaleDateString("de-DE")}\n\n`;
    });

    await ctx.reply(message, { parse_mode: "HTML", ...mainMenu });
});

// Statistik
municipalBot.hears("📊 Statistik", checkRegistration, async (ctx) => {
    const worker = (ctx as any).worker;

    const stats = await (prisma as any).municipalTask.groupBy({
        by: ["status"],
        where: { workerId: worker.id },
        _count: true
    });

    const completed = stats.find((s: any) => s.status === "COMPLETED")?._count || 0;
    const inProgress = stats.find((s: any) => s.status === "IN_PROGRESS")?._count || 0;

    let message = `📊 <b>Ihre Statistik</b>\n\n`;
    message += `✅ Erledigt: ${completed}\n`;
    message += `🔄 In Arbeit: ${inProgress}\n`;
    message += `\n👤 Abteilung: ${worker.department || "Nicht angegeben"}\n`;

    await ctx.reply(message, { parse_mode: "HTML", ...mainMenu });
});

// Profil
municipalBot.hears("👤 Profil", checkRegistration, async (ctx) => {
    const worker = (ctx as any).worker;

    let message = `👤 <b>Ihr Profil</b>\n\n`;
    message += `👨‍💼 ${worker.firstName} ${worker.lastName || ""}\n`;
    message += `📞 ${worker.phone || "Nicht angegeben"}\n`;
    message += `🏢 Abteilung: ${worker.department || "Nicht angegeben"}\n`;
    message += `📅 Registrierungsdatum: ${new Date(worker.createdAt).toLocaleDateString("de-DE")}\n`;

    await ctx.reply(message, { parse_mode: "HTML", ...mainMenu });
});

console.log("[Municipal Bot] Initialized.");

export default municipalBot;
