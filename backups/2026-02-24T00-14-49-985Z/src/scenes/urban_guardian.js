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
exports.urbanGuardianScene = void 0;
var telegraf_1 = require("telegraf");
var gemini_1 = require("../services/gemini");
var prisma_1 = require("../services/prisma");
var axios_1 = require("axios");
var reputation_1 = require("../services/reputation");
var city_hall_bot_1 = require("../city_hall_bot");
var keyboards_1 = require("../keyboards");
var life_recorder_1 = require("../services/life_recorder");
exports.urbanGuardianScene = new telegraf_1.Scenes.WizardScene("urban_guardian", 
// Step 1: Ask for Photo
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.reply("📸 Sende ein Foto des Infrastrukturproblems (Schlagloch, Müll, defekte Laterne usw.).")];
            case 1:
                _a.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 2: Receive Photo (or Text Override)
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var message, buffer, description, hasPhoto, hasText, photo, fileLink, response, e_1, analysis, e_2, userDescription;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                message = ctx.message;
                if (!message)
                    return [2 /*return*/]; // Should not happen in wizard
                description = undefined;
                hasPhoto = message.photo && message.photo.length > 0;
                hasText = message.text && message.text.length > 0;
                if (!hasPhoto) return [3 /*break*/, 17];
                photo = message.photo.pop();
                _b.label = 1;
            case 1:
                _b.trys.push([1, 4, , 6]);
                return [4 /*yield*/, ctx.telegram.getFileLink(photo.file_id)];
            case 2:
                fileLink = _b.sent();
                return [4 /*yield*/, axios_1.default.get(fileLink.href, { responseType: "arraybuffer" })];
            case 3:
                response = _b.sent();
                buffer = Buffer.from(response.data, "binary");
                // Cache in session
                // @ts-ignore
                if (!ctx.session.reportData)
                    ctx.session.reportData = {};
                // @ts-ignore
                ctx.session.reportData.photoId = photo.file_id;
                // @ts-ignore
                ctx.session.reportData.lastImageBase64 = buffer.toString("base64");
                return [3 /*break*/, 6];
            case 4:
                e_1 = _b.sent();
                console.error(e_1);
                return [4 /*yield*/, ctx.reply("❌ Fehler beim Hochladen des Fotos.")];
            case 5:
                _b.sent();
                return [2 /*return*/];
            case 6: 
            // --- GEMINI ANALYSIS START ---
            return [4 /*yield*/, ctx.reply("🔍 Analysiere...")];
            case 7:
                // --- GEMINI ANALYSIS START ---
                _b.sent();
                _b.label = 8;
            case 8:
                _b.trys.push([8, 14, , 16]);
                return [4 /*yield*/, (0, gemini_1.analyzeImage)(buffer)];
            case 9:
                analysis = _b.sent();
                console.log("Analysis:", analysis);
                if (!analysis.is_issue) return [3 /*break*/, 11];
                // Success
                // @ts-ignore
                ctx.session.reportData.aiVerdict = JSON.stringify(analysis);
                // @ts-ignore
                ctx.session.reportData.category = analysis.category; // Gemini suggested category
                return [4 /*yield*/, ctx.reply("\u2705 Problem erkannt: ".concat(analysis.category, " (Sicherheit: ").concat((analysis.confidence * 100).toFixed(1), "%)\n\nDu kannst die Kategorie best\u00E4tigen oder eine andere w\u00E4hlen:"), telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("🛣️ Straßen", "cat_Roads"), telegraf_1.Markup.button.callback("💡 Beleuchtung", "cat_Lighting")],
                        [telegraf_1.Markup.button.callback("🗑️ Müll", "cat_Waste"), telegraf_1.Markup.button.callback("🌳 Parks", "cat_Parks")],
                        [telegraf_1.Markup.button.callback("🎨 Vandalismus", "cat_Vandalism"), telegraf_1.Markup.button.callback("🚰 Wasser", "cat_Water")],
                        [telegraf_1.Markup.button.callback("🚗 Fahrzeuge", "cat_Vehicles"), telegraf_1.Markup.button.callback("❓ Sonstiges", "cat_Other")]
                    ]))];
            case 10:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
            case 11: 
            // Failure / Unsure
            return [4 /*yield*/, ctx.reply("\uD83E\uDD14 Gemini ist unsicher (".concat(analysis.category, ").\n\nBitte Kategorie manuell w\u00E4hlen:"), telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback("🛣️ Straßen", "cat_Roads"), telegraf_1.Markup.button.callback("💡 Beleuchtung", "cat_Lighting")],
                    [telegraf_1.Markup.button.callback("🗑️ Müll", "cat_Waste"), telegraf_1.Markup.button.callback("🌳 Parks", "cat_Parks")],
                    [telegraf_1.Markup.button.callback("🎨 Vandalismus", "cat_Vandalism"), telegraf_1.Markup.button.callback("🚰 Wasser", "cat_Water")],
                    [telegraf_1.Markup.button.callback("🚗 Fahrzeuge", "cat_Vehicles"), telegraf_1.Markup.button.callback("❓ Sonstiges", "cat_Other")]
                ]))];
            case 12:
                // Failure / Unsure
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
            case 13: return [3 /*break*/, 16];
            case 14:
                e_2 = _b.sent();
                console.error(e_2);
                return [4 /*yield*/, ctx.reply("❌ Bei der Analyse ist ein Fehler aufgetreten.")];
            case 15:
                _b.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 16: return [3 /*break*/, 24];
            case 17:
                if (!hasText) return [3 /*break*/, 22];
                if (!((_a = ctx.session.reportData) === null || _a === void 0 ? void 0 : _a.lastImageBase64)) return [3 /*break*/, 19];
                userDescription = message.text;
                // @ts-ignore
                ctx.session.reportData.description = userDescription;
                // Override Verdict
                // @ts-ignore
                ctx.session.reportData.aiVerdict = JSON.stringify({ is_issue: true, confidence: 1, category: "manual_override" });
                return [4 /*yield*/, ctx.reply("\u270D\uFE0F Beschreibung erhalten. Bitte Kategorie w\u00E4hlen:", telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("🛣️ Straßen", "cat_Roads"), telegraf_1.Markup.button.callback("💡 Beleuchtung", "cat_Lighting")],
                        [telegraf_1.Markup.button.callback("🗑️ Müll", "cat_Waste"), telegraf_1.Markup.button.callback("🌳 Parks", "cat_Parks")],
                        [telegraf_1.Markup.button.callback("🎨 Vandalismus", "cat_Vandalism"), telegraf_1.Markup.button.callback("🚰 Wasser", "cat_Water")],
                        [telegraf_1.Markup.button.callback("🚗 Fahrzeuge", "cat_Vehicles"), telegraf_1.Markup.button.callback("❓ Sonstiges", "cat_Other")]
                    ]))];
            case 18:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
            case 19: return [4 /*yield*/, ctx.reply("📸 Bitte zuerst ein Foto senden.")];
            case 20:
                _b.sent();
                return [2 /*return*/];
            case 21: return [3 /*break*/, 24];
            case 22: return [4 /*yield*/, ctx.reply("Bitte sende ein Foto oder Text.")];
            case 23:
                _b.sent();
                return [2 /*return*/];
            case 24: return [2 /*return*/];
        }
    });
}); }, 
// Step 3: Handle Category Selection
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var callbackData, category;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                callbackData = (_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data;
                if (!(!callbackData || !callbackData.startsWith("cat_"))) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply("Bitte wähle eine Kategorie, indem du auf die Taste klickst.")];
            case 1:
                _b.sent();
                return [2 /*return*/];
            case 2:
                category = callbackData.replace("cat_", "");
                // @ts-ignore
                ctx.session.reportData.category = category;
                return [4 /*yield*/, ctx.answerCbQuery("Ausgew\u00E4hlt: ".concat(category))];
            case 3:
                _b.sent();
                return [4 /*yield*/, ctx.reply("\uD83D\uDCCD Best\u00E4tigt: ".concat(category, ".\n\nJetzt sende deinen Standort (B\u00FCroklammer -> Standort)."))];
            case 4:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 4: Location (Reached after Category Selection)
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var location, report, nextSteps, keyboard, adminChatId, isLowPriority, priorityZone, categoryEmojiMap, emoji, caption, imageBuffer;
    var _a, _b, _c;
    return __generator(this, function (_d) {
        switch (_d.label) {
            case 0:
                if (!!((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.location)) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply("Bitte sende deinen Standort (Büroklammer -> Standort).")];
            case 1:
                _d.sent();
                return [2 /*return*/];
            case 2:
                location = ctx.message.location;
                if (!(ctx.user && ctx.session.reportData)) return [3 /*break*/, 10];
                return [4 /*yield*/, prisma_1.default.report.create({
                        data: {
                            authorId: ctx.user.id,
                            photoId: ctx.session.reportData.photoId,
                            aiVerdict: ctx.session.reportData.aiVerdict,
                            category: ctx.session.reportData.category,
                            // @ts-ignore
                            description: ctx.session.reportData.description || null,
                            latitude: location.latitude,
                            longitude: location.longitude,
                        }
                    })];
            case 3:
                report = _d.sent();
                // Log Activity
                return [4 /*yield*/, (0, life_recorder_1.recordActivity)(ctx.user.id, "REPORT_SUBMITTED", { reportId: report.id, category: report.category })];
            case 4:
                // Log Activity
                _d.sent();
                // Update user's updatedAt to pull them to the top of the admin's 'Recent' list
                return [4 /*yield*/, prisma_1.default.user.update({
                        where: { id: ctx.user.id },
                        data: { updatedAt: new Date() }
                    })];
            case 5:
                // Update user's updatedAt to pull them to the top of the admin's 'Recent' list
                _d.sent();
                return [4 /*yield*/, (0, reputation_1.awardDignity)(ctx.user.id, 2)];
            case 6:
                _d.sent();
                nextSteps = "";
                keyboard = undefined;
                if (ctx.session.activeQuest) {
                    // Redirect user to Maps for their delivery
                    // Just mock link to Würzburg center or user's last known loc
                    nextSteps = "🎒 Lieferung läuft weiter! Kehre zur Route zurück.";
                    // Could verify against delivery address but for MVP generic
                    keyboard = telegraf_1.Markup.inlineKeyboard([
                        telegraf_1.Markup.button.url("🗺️ Zur Route (Google Maps)", "https://www.google.com/maps"),
                        telegraf_1.Markup.button.callback("📜 Quest-Menü", "exit_to_menu") // Should be handled or just text
                    ]);
                }
                else {
                    nextSteps = "Du bist frei! Einen schönen Tag und danke für deine Hilfe für die Stadt! 🏙️";
                    keyboard = keyboards_1.mainMenu;
                }
                return [4 /*yield*/, ctx.reply("\u2705 Danke! Dein Bericht wurde angenommen.\n\nWenn das Rathaus das Problem best\u00E4tigt, wird dein Rating verdoppelt (+5 Punkte)!\n\n".concat(nextSteps), keyboard)];
            case 7:
                _d.sent();
                if (!city_hall_bot_1.cityHallBot) return [3 /*break*/, 10];
                adminChatId = process.env.ADMIN_CHAT_ID;
                if (!(adminChatId && adminChatId !== "0")) return [3 /*break*/, 9];
                isLowPriority = ((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.urbanBanExpiresAt) && new Date(ctx.user.urbanBanExpiresAt) > new Date();
                priorityZone = isLowPriority ? "🔴 KATEGORIE B (Niedrigere Priorität - Fehler)" : "🟢 KATEGORIE A (Hohe Priorität)";
                categoryEmojiMap = {
                    "Roads": "🛣️", "Lighting": "💡", "Waste": "🗑️", "Parks": "🌳",
                    "Vandalism": "🎨", "Water": "🚰", "Vehicles": "🚗", "Other": "❓"
                };
                emoji = categoryEmojiMap[report.category || ""] || "📋";
                caption = "\uD83C\uDFDB\uFE0F NEUER BERICHT (ID: ".concat(report.id.slice(0, 4), ")\n\n").concat(priorityZone, "\n\n\uD83D\uDC64 Autor ID: ").concat((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.id.slice(0, 8), "\n\uD83D\uDCC2 Kategorie: ").concat(emoji, " ").concat(report.category, "\n\uD83D\uDCDD Beschreibung: ").concat(report.description || "—", "\n\uD83D\uDCCD Standort: ").concat(location.latitude, ", ").concat(location.longitude);
                imageBuffer = Buffer.from(ctx.session.reportData.lastImageBase64 || "", "base64");
                return [4 /*yield*/, city_hall_bot_1.cityHallBot.telegram.sendPhoto(adminChatId, { source: imageBuffer }, __assign({ caption: caption }, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("✅ Bestätigen (Wahr)", "approve_report_".concat(report.id)), telegraf_1.Markup.button.callback("❌ Fake (Falsch)", "reject_report_".concat(report.id))],
                        [telegraf_1.Markup.button.callback("👤 Autor verwalten", "manage_user_".concat(report.authorId))]
                    ])))];
            case 8:
                _d.sent();
                return [3 /*break*/, 10];
            case 9:
                console.log("Admin Chat ID not set. Report saved but not sent to City Hall.");
                _d.label = 10;
            case 10: return [2 /*return*/, ctx.scene.leave()];
        }
    });
}); });
