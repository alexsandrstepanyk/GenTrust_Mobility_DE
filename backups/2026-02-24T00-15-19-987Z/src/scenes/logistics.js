"use strict";
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
exports.logisticsScene = void 0;
var telegraf_1 = require("telegraf");
var prisma_1 = require("../services/prisma");
var reputation_1 = require("../services/reputation");
var keyboards_1 = require("../keyboards");
var life_recorder_1 = require("../services/life_recorder");
exports.logisticsScene = new telegraf_1.Scenes.BaseScene("logistics");
// Utility to generate random 4-digit code
var generateCode = function () { return Math.floor(1000 + Math.random() * 9000).toString(); };
exports.logisticsScene.enter(function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var quests, buttons;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                if (!ctx.session.activeQuest) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply("\uD83D\uDCE6 Du hast bereits eine aktive Bestellung!\n\n\uD83D\uDCCC **".concat(ctx.session.activeQuest.title || 'Lieferung', "**\n\uD83D\uDD11 Dein Abholcode: *").concat(ctx.session.activeQuest.pickupCode, "*\n\nGib den Code vom Kunden ein, um abzuschlie\u00DFen:"), { parse_mode: "Markdown" })];
            case 1:
                _c.sent();
                return [2 /*return*/];
            case 2: return [4 /*yield*/, prisma_1.default.quest.findMany({
                    where: {
                        status: "OPEN",
                        city: ((_a = ctx.user) === null || _a === void 0 ? void 0 : _a.city) || undefined
                    },
                    take: 5
                })];
            case 3:
                quests = _c.sent();
                if (!(quests.length === 0)) return [3 /*break*/, 5];
                return [4 /*yield*/, ctx.reply("📭 Leider gibt es in deiner Stadt aktuell keine freien Bestellungen. Schau später vorbei!", keyboards_1.mainMenu)];
            case 4:
                _c.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 5:
                buttons = quests.map(function (q) { return [
                    telegraf_1.Markup.button.callback("\uD83D\uDCE6 ".concat(q.title || 'Lieferung', " (").concat(q.reward, "\u20AC)"), "take_real_quest_".concat(q.id))
                ]; });
                buttons.push([telegraf_1.Markup.button.callback("🚪 Zurück", "exit_logistics")]);
                return [4 /*yield*/, ctx.reply("\uD83D\uDCE6 Verf\u00FCgbare Bestellungen in der Stadt ".concat(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.city) || '', ":"), telegraf_1.Markup.inlineKeyboard(buttons))];
            case 6:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
exports.logisticsScene.action(/^take_real_quest_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var questId, pickupCode, deliveryCode, quest;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                questId = ctx.match[1];
                pickupCode = generateCode();
                deliveryCode = generateCode();
                return [4 /*yield*/, prisma_1.default.quest.update({
                        where: { id: questId },
                        data: {
                            status: "IN_PROGRESS",
                            assigneeId: (_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id,
                            pickupCode: pickupCode,
                            deliveryCode: deliveryCode
                        }
                    })];
            case 1:
                quest = _c.sent();
                if (!((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.id)) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, life_recorder_1.recordActivity)(ctx.user.id, "QUEST_STARTED", { questId: questId, title: quest.title })];
            case 2:
                _c.sent();
                _c.label = 3;
            case 3:
                // Store in session
                ctx.session.activeQuest = {
                    id: quest.id,
                    title: quest.title,
                    reward: quest.reward,
                    pickupCode: pickupCode,
                    deliveryCode: deliveryCode
                };
                return [4 /*yield*/, ctx.answerCbQuery("Bestellung angenommen!")];
            case 4:
                _c.sent();
                return [4 /*yield*/, ctx.reply("\u2705 Du hast die Bestellung angenommen: **".concat(quest.title, "**\n    \n1\uFE0F\u20E3 Geh zur Abholstation.\n\uD83D\uDD11 Abholcode: *").concat(pickupCode, "*\n\n2\uFE0F\u20E3 Bring die Bestellung zum Kunden.\n\uD83E\uDD14 Wenn der Kunde dir den BEST\u00C4TIGUNGSCODE sagt, gib ihn hier ein.\n(\uD83D\uDD75\uFE0F\u200D\u2642\uFE0F Kundencode: ").concat(deliveryCode, ")"), { parse_mode: "Markdown" })];
            case 5:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
exports.logisticsScene.on("message", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var text, reward;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                text = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                if (!(text && text.startsWith("/"))) return [3 /*break*/, 3];
                return [4 /*yield*/, ctx.scene.leave()];
            case 1:
                _b.sent();
                return [4 /*yield*/, ctx.reply("Nutze das Menü unten:", keyboards_1.mainMenu)];
            case 2:
                _b.sent();
                return [2 /*return*/];
            case 3:
                if (!(ctx.session.activeQuest && text)) return [3 /*break*/, 13];
                if (!(text.trim() === ctx.session.activeQuest.deliveryCode)) return [3 /*break*/, 10];
                reward = ctx.session.activeQuest.reward;
                if (!ctx.user) return [3 /*break*/, 9];
                // Update DB
                return [4 /*yield*/, prisma_1.default.user.update({
                        where: { id: ctx.user.id },
                        data: {
                            balance: { increment: reward }
                        }
                    })];
            case 4:
                // Update DB
                _b.sent();
                // Update Quest status in DB
                return [4 /*yield*/, prisma_1.default.quest.update({
                        where: { id: ctx.session.activeQuest.id },
                        data: {
                            status: "COMPLETED",
                        }
                    })];
            case 5:
                // Update Quest status in DB
                _b.sent();
                return [4 /*yield*/, (0, life_recorder_1.recordActivity)(ctx.user.id, "QUEST_COMPLETED", { questId: ctx.session.activeQuest.id })];
            case 6:
                _b.sent();
                return [4 /*yield*/, (0, reputation_1.awardDignity)(ctx.user.id, 5)];
            case 7:
                _b.sent();
                return [4 /*yield*/, ctx.reply("\uD83C\uDF89 RICHTIG! Aufgabe \"".concat(ctx.session.activeQuest.title, "\" erledigt.\n\uD83D\uDCB0 Dein Guthaben wurde um ").concat(reward, "\u20AC erh\u00F6ht.\n\uD83C\uDFC6 +5 Dignity Score."), keyboards_1.mainMenu)];
            case 8:
                _b.sent();
                delete ctx.session.activeQuest;
                return [2 /*return*/, ctx.scene.leave()];
            case 9: return [3 /*break*/, 12];
            case 10: return [4 /*yield*/, ctx.reply("❌ Falscher Code! Bitte den Kunden, den richtigen Code erneut zu sagen.")];
            case 11:
                _b.sent();
                _b.label = 12;
            case 12: return [3 /*break*/, 17];
            case 13:
                if (!ctx.session.activeQuest) return [3 /*break*/, 15];
                return [4 /*yield*/, ctx.reply("⌨️ Gib den 4-stelligen Code ein, den dir der Kunde genannt hat.")];
            case 14:
                _b.sent();
                return [3 /*break*/, 17];
            case 15: 
            // Should usually be handled by enter, but if they text garbage in menu
            return [4 /*yield*/, ctx.reply("Wähle eine Bestellung aus dem Menü.")];
            case 16:
                // Should usually be handled by enter, but if they text garbage in menu
                _b.sent();
                _b.label = 17;
            case 17: return [2 /*return*/];
        }
    });
}); });
exports.logisticsScene.action("exit_logistics", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.answerCbQuery()];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.reply("Zurück zum Hauptmenü.", keyboards_1.mainMenu)];
            case 2:
                _a.sent();
                return [2 /*return*/, ctx.scene.leave()];
        }
    });
}); });
