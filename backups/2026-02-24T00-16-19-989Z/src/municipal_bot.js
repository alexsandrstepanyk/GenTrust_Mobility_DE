"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.municipalBot = void 0;
var telegraf_1 = require("telegraf");
var dotenv = require("dotenv");
var prisma_1 = require("./services/prisma");
var municipal_onboarding_1 = require("./scenes/municipal_onboarding");
var axios_1 = require("axios");
var messenger_1 = require("./services/messenger");
var life_recorder_1 = require("./services/life_recorder");
dotenv.config();
var token = process.env.MUNICIPAL_BOT_TOKEN;
var scoutToken = process.env.BOT_TOKEN;
if (!token) {
    console.error("[Municipal Bot] MUNICIPAL_BOT_TOKEN not found in .env");
    process.exit(1);
}
exports.municipalBot = new telegraf_1.Telegraf(token);
// Middleware
exports.municipalBot.use((0, telegraf_1.session)());
// @ts-ignore
var stage = new telegraf_1.Scenes.Stage([municipal_onboarding_1.municipalOnboardingScene]);
var menuTriggers = new Set([
    "📋 Meine Aufgaben",
    "✅ Erledigt",
    "📊 Statistik",
    "👤 Profil",
    "❌ Abbrechen",
    "/start"
]);
exports.municipalBot.use(function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    var text, e_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(ctx.message && "text" in ctx.message)) return [3 /*break*/, 4];
                text = ctx.message.text;
                if (!(text.startsWith("/") || menuTriggers.has(text))) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                return [4 /*yield*/, ctx.scene.leave()];
            case 2:
                _a.sent();
                return [3 /*break*/, 4];
            case 3:
                e_1 = _a.sent();
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/, next()];
        }
    });
}); });
// @ts-ignore
exports.municipalBot.use(stage.middleware());
// Middleware für Registrierungsprüfung
var checkRegistration = function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    var worker;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!ctx.from)
                    return [2 /*return*/];
                return [4 /*yield*/, prisma_1.default.municipalWorker.findUnique({
                        where: { telegramId: BigInt(ctx.from.id) }
                    })];
            case 1:
                worker = _a.sent();
                if (!worker || worker.status !== "ACTIVE") {
                    return [2 /*return*/, ctx.reply("⚠️ Sie sind nicht registriert oder Ihr Konto wurde noch nicht genehmigt.\n\nVerwenden Sie /start zur Registrierung.")];
                }
                ctx.worker = worker;
                return [2 /*return*/, next()];
        }
    });
}); };
// Hauptmenü
var mainMenu = telegraf_1.Markup.keyboard([
    ["📋 Meine Aufgaben", "✅ Erledigt"],
    ["📊 Statistik", "👤 Profil"],
    ["❌ Abbrechen"]
]).resize();
// Befehl /start
exports.municipalBot.start(function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var worker;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, prisma_1.default.municipalWorker.findUnique({
                    where: { telegramId: BigInt(ctx.from.id) }
                })];
            case 1:
                worker = _a.sent();
                if (worker) {
                    if (worker.status === "PENDING") {
                        return [2 /*return*/, ctx.reply("⏳ Ihre Bewerbung wird geprüft. Warten Sie auf die Genehmigung durch den Administrator.")];
                    }
                    else if (worker.status === "ACTIVE") {
                        return [2 /*return*/, ctx.reply("Willkommen, ".concat(worker.firstName, "! \uD83D\uDC4B\n\nSie sind bereits im Kommunaldienstsystem registriert."), mainMenu)];
                    }
                    else if (worker.status === "BLOCKED") {
                        return [2 /*return*/, ctx.reply("🚫 Ihr Konto wurde gesperrt. Wenden Sie sich an den Administrator.")];
                    }
                }
                // Neuer Benutzer - Onboarding starten
                return [4 /*yield*/, ctx.reply("Willkommen im Kommunaldienstsystem! 🏗️\n\nUm mit der Arbeit zu beginnen, müssen Sie sich registrieren.")];
            case 2:
                // Neuer Benutzer - Onboarding starten
                _a.sent();
                return [2 /*return*/, ctx.scene.enter("municipal_onboarding")];
        }
    });
}); });
exports.municipalBot.hears("❌ Abbrechen", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var e_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, ctx.scene.leave()];
            case 1:
                _a.sent();
                return [3 /*break*/, 3];
            case 2:
                e_2 = _a.sent();
                return [3 /*break*/, 3];
            case 3: return [4 /*yield*/, ctx.reply("Zurück zum Hauptmenü.", mainMenu)];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Konto-Diagnose
exports.municipalBot.command("whoami", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var telegramId, worker;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                telegramId = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                if (!telegramId)
                    return [2 /*return*/, ctx.reply("❌ Telegram ID konnte nicht ermittelt werden.")];
                return [4 /*yield*/, prisma_1.default.municipalWorker.findUnique({
                        where: { telegramId: BigInt(telegramId) }
                    })];
            case 1:
                worker = _b.sent();
                if (!worker) {
                    return [2 /*return*/, ctx.reply("\uD83C\uDD94 Ihre Telegram ID: ".concat(telegramId, "\n\n\u2705 Sie sind noch nicht registriert. Verwenden Sie /start zur Registrierung."))];
                }
                return [2 /*return*/, ctx.reply("\uD83C\uDD94 Ihre Telegram ID: ".concat(telegramId, "\n") +
                        "\uD83D\uDC64 Name: ".concat(worker.firstName || "—", " ").concat(worker.lastName || "", "\n") +
                        "\uD83C\uDFE2 Abteilung: ".concat(worker.department || "—", "\n") +
                        "\uD83D\uDCCC Status: ".concat(worker.status, "\n\n") +
                        (worker.status === "ACTIVE"
                            ? "✅ Konto aktiv. Verwenden Sie /start oder die Menü-Tasten."
                            : "⏳ Warten Sie auf die Genehmigung oder wenden Sie sich an den Administrator."))];
        }
    });
}); });
// Button "Meine Aufgaben"
exports.municipalBot.hears("📋 Meine Aufgaben", checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var worker, tasks, message, _i, tasks_1, task, priorityEmoji, emoji, statusText;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                worker = ctx.worker;
                return [4 /*yield*/, prisma_1.default.municipalTask.findMany({
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
                    })];
            case 1:
                tasks = _a.sent();
                if (tasks.length === 0) {
                    return [2 /*return*/, ctx.reply("📭 Derzeit keine aktiven Aufgaben.", mainMenu)];
                }
                message = "\uD83D\uDCCB <b>Aktive Aufgaben (".concat(tasks.length, ")</b>\n\n");
                for (_i = 0, tasks_1 = tasks; _i < tasks_1.length; _i++) {
                    task = tasks_1[_i];
                    priorityEmoji = {
                        "URGENT": "🚨",
                        "HIGH": "⚠️",
                        "MEDIUM": "📌",
                        "LOW": "ℹ️"
                    };
                    emoji = priorityEmoji[task.priority] || "📌";
                    statusText = task.status === "IN_PROGRESS" ? "🔄 In Arbeit" : "🆕 Neu";
                    message += "".concat(emoji, " <b>").concat(task.report.category || "Problem", "</b>\n");
                    message += "".concat(statusText, "\n");
                    message += "\uD83D\uDCCD Koordinaten: ".concat(task.report.latitude.toFixed(5), ", ").concat(task.report.longitude.toFixed(5), "\n");
                    if (task.report.description) {
                        message += "\uD83D\uDCDD ".concat(task.report.description, "\n");
                    }
                    message += "\n";
                }
                return [4 /*yield*/, ctx.reply(message, __assign({ parse_mode: "HTML" }, telegraf_1.Markup.inlineKeyboard(tasks.slice(0, 5).map(function (task) { return [
                        telegraf_1.Markup.button.callback("".concat(task.status === "IN_PROGRESS" ? "🔄" : "👁️", " ").concat(task.report.category || "Aufgabe"), "view_task_".concat(task.id))
                    ]; }))))];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Einzelaufgabe anzeigen
exports.municipalBot.action(/^view_task_(.+)/, checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var taskId, worker, task, priorityMap, priorityEmoji, message, buttons, fileResp, filePath, fileUrl, imgResp, buffer, e_3, err_1;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                taskId = ctx.match[1];
                worker = ctx.worker;
                return [4 /*yield*/, prisma_1.default.municipalTask.findUnique({
                        where: { id: taskId },
                        include: {
                            report: {
                                include: {
                                    author: true
                                }
                            },
                            assignedTo: true
                        }
                    })];
            case 1:
                task = _c.sent();
                if (!task) {
                    return [2 /*return*/, ctx.answerCbQuery("❌ Aufgabe nicht gefunden")];
                }
                priorityMap = {
                    "URGENT": "🚨 DRINGEND",
                    "HIGH": "⚠️ HOHE PRIORITÄT",
                    "MEDIUM": "📌 MITTLERE PRIORITÄT",
                    "LOW": "ℹ️ NIEDRIGE PRIORITÄT"
                };
                priorityEmoji = priorityMap[task.priority] || "📌";
                message = "".concat(priorityEmoji, "\n\n");
                message += "\uD83D\uDCCD <b>Standort:</b>\n";
                message += "Koordinaten: ".concat(task.report.latitude.toFixed(6), ", ").concat(task.report.longitude.toFixed(6), "\n\n");
                message += "\uD83D\uDDC2\uFE0F <b>Kategorie:</b> ".concat(task.report.category || "Nicht angegeben", "\n");
                if (task.report.description) {
                    message += "\uD83D\uDCDD <b>Beschreibung:</b> ".concat(task.report.description, "\n");
                }
                message += "\n\uD83D\uDCC5 <b>Erstellt:</b> ".concat(new Date(task.createdAt).toLocaleString("de-DE"), "\n");
                if (task.assignedTo) {
                    message += "\uD83D\uDC64 <b>Zugewiesen an:</b> ".concat(task.assignedTo.firstName, " ").concat(task.assignedTo.lastName || "", "\n");
                }
                message += "\n\uD83D\uDCCA <b>Status:</b> ".concat(task.status === "IN_PROGRESS" ? "🔄 In Arbeit" : "🆕 Offen", "\n");
                buttons = [];
                if (task.status === "OPEN" && !task.workerId) {
                    buttons.push([telegraf_1.Markup.button.callback("✅ Aufgabe annehmen", "accept_task_".concat(task.id))]);
                }
                else if (task.workerId === worker.id && task.status === "IN_PROGRESS") {
                    buttons.push([telegraf_1.Markup.button.callback("📸 Aufgabe erledigt (Foto)", "complete_task_".concat(task.id))]);
                    buttons.push([telegraf_1.Markup.button.callback("🚫 Kein Problem", "no_issue_task_".concat(task.id))]);
                    buttons.push([telegraf_1.Markup.button.callback("⚠️ Unmöglich auszuführen", "impossible_task_".concat(task.id))]);
                    buttons.push([telegraf_1.Markup.button.callback("❌ Abbrechen", "cancel_task_".concat(task.id))]);
                }
                buttons.push([telegraf_1.Markup.button.callback("🗺️ Auf Karte anzeigen", "map_task_".concat(task.id))]);
                buttons.push([telegraf_1.Markup.button.callback("⬅️ Zurück", "back_to_tasks")]);
                _c.label = 2;
            case 2:
                _c.trys.push([2, 10, , 17]);
                if (!(scoutToken && task.report.photoId)) return [3 /*break*/, 7];
                return [4 /*yield*/, axios_1.default.get("https://api.telegram.org/bot".concat(scoutToken, "/getFile"), {
                        params: { file_id: task.report.photoId }
                    })];
            case 3:
                fileResp = _c.sent();
                filePath = (_b = (_a = fileResp.data) === null || _a === void 0 ? void 0 : _a.result) === null || _b === void 0 ? void 0 : _b.file_path;
                if (!filePath) return [3 /*break*/, 7];
                fileUrl = "https://api.telegram.org/file/bot".concat(scoutToken, "/").concat(filePath);
                return [4 /*yield*/, axios_1.default.get(fileUrl, { responseType: "arraybuffer" })];
            case 4:
                imgResp = _c.sent();
                buffer = Buffer.from(imgResp.data, "binary");
                return [4 /*yield*/, ctx.replyWithPhoto({ source: buffer }, __assign({ caption: message, parse_mode: "HTML" }, telegraf_1.Markup.inlineKeyboard(buttons)))];
            case 5:
                _c.sent();
                return [4 /*yield*/, ctx.answerCbQuery()];
            case 6:
                _c.sent();
                return [2 /*return*/];
            case 7: 
            // Fallback: ohne Foto
            return [4 /*yield*/, ctx.reply(message, __assign({ parse_mode: "HTML" }, telegraf_1.Markup.inlineKeyboard(buttons)))];
            case 8:
                // Fallback: ohne Foto
                _c.sent();
                return [4 /*yield*/, ctx.answerCbQuery()];
            case 9:
                _c.sent();
                return [3 /*break*/, 17];
            case 10:
                e_3 = _c.sent();
                _c.label = 11;
            case 11:
                _c.trys.push([11, 13, , 15]);
                return [4 /*yield*/, ctx.editMessageText(message, __assign({ parse_mode: "HTML" }, telegraf_1.Markup.inlineKeyboard(buttons)))];
            case 12:
                _c.sent();
                return [3 /*break*/, 15];
            case 13:
                err_1 = _c.sent();
                return [4 /*yield*/, ctx.reply(message, __assign({ parse_mode: "HTML" }, telegraf_1.Markup.inlineKeyboard(buttons)))];
            case 14:
                _c.sent();
                return [3 /*break*/, 15];
            case 15: return [4 /*yield*/, ctx.answerCbQuery()];
            case 16:
                _c.sent();
                return [3 /*break*/, 17];
            case 17: return [2 /*return*/];
        }
    });
}); });
// Aufgabe annehmen
exports.municipalBot.action(/^accept_task_(.+)/, checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var taskId, worker, task;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                taskId = ctx.match[1];
                worker = ctx.worker;
                return [4 /*yield*/, prisma_1.default.municipalTask.update({
                        where: { id: taskId },
                        data: {
                            workerId: worker.id,
                            status: "IN_PROGRESS"
                        }
                    })];
            case 1:
                task = _a.sent();
                return [4 /*yield*/, ctx.answerCbQuery("✅ Aufgabe angenommen!")];
            case 2:
                _a.sent();
                return [4 /*yield*/, ctx.editMessageReplyMarkup({
                        inline_keyboard: [
                            [{ text: "📸 Aufgabe erledigt (Foto)", callback_data: "complete_task_".concat(task.id) }],
                            [{ text: "🚫 Kein Problem", callback_data: "no_issue_task_".concat(task.id) }],
                            [{ text: "⚠️ Unmöglich auszuführen", callback_data: "impossible_task_".concat(task.id) }],
                            [{ text: "❌ Abbrechen", callback_data: "cancel_task_".concat(task.id) }],
                            [{ text: "⬅️ Zurück", callback_data: "back_to_tasks" }]
                        ]
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Aufgabe erledigen
exports.municipalBot.action(/^complete_task_(.+)/, checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var taskId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                taskId = ctx.match[1];
                ctx.session.pendingCompletionTaskId = taskId;
                ctx.session.pendingCompletionAction = "DONE";
                return [4 /*yield*/, ctx.answerCbQuery()];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.reply("📸 Senden Sie ein Foto der erledigten Aufgabe zur Bestätigung.")];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
exports.municipalBot.on("photo", checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var pendingTaskId, pendingAction, photos, photo, completionPhotoId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                pendingTaskId = ctx.session.pendingCompletionTaskId;
                pendingAction = ctx.session.pendingCompletionAction;
                if (!pendingTaskId || pendingAction !== "DONE")
                    return [2 /*return*/];
                photos = ctx.message.photo || [];
                photo = photos[photos.length - 1];
                completionPhotoId = photo === null || photo === void 0 ? void 0 : photo.file_id;
                return [4 /*yield*/, prisma_1.default.municipalTask.update({
                        where: { id: pendingTaskId },
                        data: {
                            status: "COMPLETED",
                            completedAt: new Date(),
                            completionResult: "DONE",
                            completionPhotoId: completionPhotoId || null
                        }
                    })];
            case 1:
                _a.sent();
                ctx.session.pendingCompletionTaskId = null;
                ctx.session.pendingCompletionAction = null;
                return [4 /*yield*/, ctx.reply("✅ Danke! Foto erhalten, Aufgabe geschlossen.", mainMenu)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
exports.municipalBot.action(/^no_issue_task_(.+)/, checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var taskId, task, banUntil, e_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                taskId = ctx.match[1];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 9, , 11]);
                return [4 /*yield*/, prisma_1.default.municipalTask.update({
                        where: { id: taskId },
                        data: {
                            status: "COMPLETED",
                            completedAt: new Date(),
                            completionResult: "NO_ISSUE"
                        },
                        include: { report: { include: { author: true } } }
                    })];
            case 2:
                task = _a.sent();
                banUntil = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
                return [4 /*yield*/, prisma_1.default.user.update({
                        where: { id: task.report.authorId },
                        data: {
                            dignityScore: { decrement: 10 },
                            urbanBanExpiresAt: banUntil
                        }
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, prisma_1.default.report.update({
                        where: { id: task.reportId },
                        data: { status: "REJECTED" }
                    })];
            case 4:
                _a.sent();
                return [4 /*yield*/, (0, life_recorder_1.recordActivity)(task.report.authorId, "REPORT_REJECTED", { reportId: task.reportId, reason: "NO_ISSUE" })];
            case 5:
                _a.sent();
                return [4 /*yield*/, messenger_1.messengerHub.sendToScout(task.report.author.telegramId, "❌ Der Kommunaldienst hat kein Problem gefunden.\n\n📉 Bewertung reduziert (-10).\n🚫 Zugang zu Berichten für 7 Tage gesperrt.")];
            case 6:
                _a.sent();
                return [4 /*yield*/, ctx.answerCbQuery("Markiert: kein Problem")];
            case 7:
                _a.sent();
                return [4 /*yield*/, ctx.reply("✅ Bericht als 'Kein Problem' geschlossen.", mainMenu)];
            case 8:
                _a.sent();
                return [3 /*break*/, 11];
            case 9:
                e_4 = _a.sent();
                console.error(e_4);
                return [4 /*yield*/, ctx.answerCbQuery("Fehler")];
            case 10:
                _a.sent();
                return [3 /*break*/, 11];
            case 11: return [2 /*return*/];
        }
    });
}); });
exports.municipalBot.action(/^impossible_task_(.+)/, checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var taskId, e_5;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                taskId = ctx.match[1];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 5, , 7]);
                return [4 /*yield*/, prisma_1.default.municipalTask.update({
                        where: { id: taskId },
                        data: {
                            status: "COMPLETED",
                            completedAt: new Date(),
                            completionResult: "IMPOSSIBLE"
                        }
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, ctx.answerCbQuery("Als unmöglich markiert")];
            case 3:
                _a.sent();
                return [4 /*yield*/, ctx.reply("⚠️ Aufgabe als unmöglich auszuführen markiert.", mainMenu)];
            case 4:
                _a.sent();
                return [3 /*break*/, 7];
            case 5:
                e_5 = _a.sent();
                console.error(e_5);
                return [4 /*yield*/, ctx.answerCbQuery("Fehler")];
            case 6:
                _a.sent();
                return [3 /*break*/, 7];
            case 7: return [2 /*return*/];
        }
    });
}); });
// Aufgabe abbrechen
exports.municipalBot.action(/^cancel_task_(.+)/, checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var taskId;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                taskId = ctx.match[1];
                return [4 /*yield*/, prisma_1.default.municipalTask.update({
                        where: { id: taskId },
                        data: {
                            workerId: null,
                            status: "OPEN"
                        }
                    })];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.answerCbQuery("Aufgabe abgebrochen")];
            case 2:
                _a.sent();
                return [4 /*yield*/, ctx.reply("❌ Aufgabe in allgemeine Liste zurückgegeben.", mainMenu)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Auf Karte anzeigen
exports.municipalBot.action(/^map_task_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var taskId, task;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                taskId = ctx.match[1];
                return [4 /*yield*/, prisma_1.default.municipalTask.findUnique({
                        where: { id: taskId },
                        include: { report: true }
                    })];
            case 1:
                task = _a.sent();
                if (!task) {
                    return [2 /*return*/, ctx.answerCbQuery("❌ Aufgabe nicht gefunden")];
                }
                return [4 /*yield*/, ctx.replyWithLocation(task.report.latitude, task.report.longitude)];
            case 2:
                _a.sent();
                return [4 /*yield*/, ctx.answerCbQuery()];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Zurück zur Aufgabenliste
exports.municipalBot.action("back_to_tasks", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.answerCbQuery()];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.deleteMessage()];
            case 2:
                _a.sent();
                // Simuliere das Drücken der Taste "Meine Aufgaben"
                ctx.message = { text: "📋 Meine Aufgaben" };
                return [2 /*return*/, exports.municipalBot.hears("📋 Meine Aufgaben", checkRegistration, function () { return __awaiter(void 0, void 0, void 0, function () { return __generator(this, function (_a) {
                        return [2 /*return*/];
                    }); }); })];
        }
    });
}); });
// Erledigte Aufgaben
exports.municipalBot.hears("✅ Erledigt", checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var worker, completedTasks, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                worker = ctx.worker;
                return [4 /*yield*/, prisma_1.default.municipalTask.findMany({
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
                    })];
            case 1:
                completedTasks = _a.sent();
                if (completedTasks.length === 0) {
                    return [2 /*return*/, ctx.reply("📭 Sie haben noch keine Aufgabe erledigt.", mainMenu)];
                }
                message = "\u2705 <b>Erledigte Aufgaben (".concat(completedTasks.length, ")</b>\n\n");
                completedTasks.forEach(function (task) {
                    message += "\u2714\uFE0F ".concat(task.report.category || "Aufgabe", "\n");
                    message += "\uD83D\uDCC5 Erledigt: ".concat(new Date(task.completedAt).toLocaleDateString("de-DE"), "\n\n");
                });
                return [4 /*yield*/, ctx.reply(message, __assign({ parse_mode: "HTML" }, mainMenu))];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
// Statistik
exports.municipalBot.hears("📊 Statistik", checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var worker, stats, completed, inProgress, message;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                worker = ctx.worker;
                return [4 /*yield*/, prisma_1.default.municipalTask.groupBy({
                        by: ["status"],
                        where: { workerId: worker.id },
                        _count: true
                    })];
            case 1:
                stats = _c.sent();
                completed = ((_a = stats.find(function (s) { return s.status === "COMPLETED"; })) === null || _a === void 0 ? void 0 : _a._count) || 0;
                inProgress = ((_b = stats.find(function (s) { return s.status === "IN_PROGRESS"; })) === null || _b === void 0 ? void 0 : _b._count) || 0;
                message = "\uD83D\uDCCA <b>Ihre Statistik</b>\n\n";
                message += "\u2705 Erledigt: ".concat(completed, "\n");
                message += "\uD83D\uDD04 In Arbeit: ".concat(inProgress, "\n");
                message += "\n\uD83D\uDC64 Abteilung: ".concat(worker.department || "Nicht angegeben", "\n");
                return [4 /*yield*/, ctx.reply(message, __assign({ parse_mode: "HTML" }, mainMenu))];
            case 2:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
// Profil
exports.municipalBot.hears("👤 Profil", checkRegistration, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var worker, message;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                worker = ctx.worker;
                message = "\uD83D\uDC64 <b>Ihr Profil</b>\n\n";
                message += "\uD83D\uDC68\u200D\uD83D\uDCBC ".concat(worker.firstName, " ").concat(worker.lastName || "", "\n");
                message += "\uD83D\uDCDE ".concat(worker.phone || "Nicht angegeben", "\n");
                message += "\uD83C\uDFE2 Abteilung: ".concat(worker.department || "Nicht angegeben", "\n");
                message += "\uD83D\uDCC5 Registrierungsdatum: ".concat(new Date(worker.createdAt).toLocaleDateString("de-DE"), "\n");
                return [4 /*yield*/, ctx.reply(message, __assign({ parse_mode: "HTML" }, mainMenu))];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}); });
console.log("[Municipal Bot] Initialized.");
exports.default = exports.municipalBot;
