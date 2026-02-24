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
                return [4 /*yield*/, ctx.reply("\uD83D\uDCE6 \u0412 \u0442\u0435\u0431\u0435 \u0432\u0436\u0435 \u0454 \u0430\u043A\u0442\u0438\u0432\u043D\u0435 \u0437\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F!\n\n\uD83D\uDCCC **".concat(ctx.session.activeQuest.title || 'Доставка', "**\n\uD83D\uDD11 \u0422\u0432\u0456\u0439 \u043A\u043E\u0434 \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043D\u044F: *").concat(ctx.session.activeQuest.pickupCode, "*\n\n\u0412\u0432\u0435\u0434\u0438 \u043A\u043E\u0434 \u0432\u0456\u0434 \u043A\u043B\u0456\u0454\u043D\u0442\u0430 \u0434\u043B\u044F \u0437\u0430\u0432\u0435\u0440\u0448\u0435\u043D\u043D\u044F:"), { parse_mode: "Markdown" })];
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
                return [4 /*yield*/, ctx.reply("📭 На жаль, у твоєму місті поки немає вільних замовлень. Заходь пізніше!", keyboards_1.mainMenu)];
            case 4:
                _c.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 5:
                buttons = quests.map(function (q) { return [
                    telegraf_1.Markup.button.callback("\uD83D\uDCE6 ".concat(q.title || 'Доставка', " (").concat(q.reward, "\u20AC)"), "take_real_quest_".concat(q.id))
                ]; });
                buttons.push([telegraf_1.Markup.button.callback("🚪 Повернутися", "exit_logistics")]);
                return [4 /*yield*/, ctx.reply("\uD83D\uDCE6 \u0414\u043E\u0441\u0442\u0443\u043F\u043D\u0456 \u0437\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F \u0443 \u043C\u0456\u0441\u0442\u0456 ".concat(((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.city) || '', ":"), telegraf_1.Markup.inlineKeyboard(buttons))];
            case 6:
                _c.sent();
                return [2 /*return*/];
        }
    });
}); });
exports.logisticsScene.action(/^take_real_quest_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var questId, pickupCode, deliveryCode, quest;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
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
                quest = _b.sent();
                // Store in session
                ctx.session.activeQuest = {
                    id: quest.id,
                    title: quest.title,
                    reward: quest.reward,
                    pickupCode: pickupCode,
                    deliveryCode: deliveryCode
                };
                return [4 /*yield*/, ctx.answerCbQuery("Замовлення прийнято!")];
            case 2:
                _b.sent();
                return [4 /*yield*/, ctx.reply("\u2705 \u0422\u0438 \u0432\u0437\u044F\u0432 \u0437\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F: **".concat(quest.title, "**\n    \n1\uFE0F\u20E3 \u0419\u0434\u0438 \u0434\u043E \u0442\u043E\u0447\u043A\u0438 \u0432\u0438\u0434\u0430\u0447\u0456.\n\uD83D\uDD11 \u041A\u043E\u0434 \u0432\u0438\u0434\u0430\u0447\u0456: *").concat(pickupCode, "*\n\n2\uFE0F\u20E3 \u0412\u0456\u0434\u043D\u0435\u0441\u0438 \u0437\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F \u043A\u043B\u0456\u0454\u043D\u0442\u0443.\n\uD83E\uDD14 \u041A\u043E\u043B\u0438 \u043A\u043B\u0456\u0454\u043D\u0442 \u0441\u043A\u0430\u0436\u0435 \u0442\u043E\u0431\u0456 \u041A\u041E\u0414 \u041F\u0406\u0414\u0422\u0412\u0415\u0420\u0414\u0416\u0415\u041D\u041D\u042F, \u0432\u0432\u0435\u0434\u0438 \u0439\u043E\u0433\u043E \u0441\u044E\u0434\u0438.\n(\uD83D\uDD75\uFE0F\u200D\u2642\uFE0F \u041A\u043E\u0434 \u043A\u043B\u0456\u0454\u043D\u0442\u0430: ").concat(deliveryCode, ")"), { parse_mode: "Markdown" })];
            case 3:
                _b.sent();
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
                if (!(ctx.session.activeQuest && text)) return [3 /*break*/, 9];
                if (!(text.trim() === ctx.session.activeQuest.deliveryCode)) return [3 /*break*/, 6];
                reward = ctx.session.activeQuest.reward;
                if (!ctx.user) return [3 /*break*/, 5];
                // Update DB
                return [4 /*yield*/, prisma_1.default.user.update({
                        where: { id: ctx.user.id },
                        data: {
                            balance: { increment: reward }
                        }
                    })];
            case 1:
                // Update DB
                _b.sent();
                // Update Quest status in DB
                return [4 /*yield*/, prisma_1.default.quest.update({
                        where: { id: ctx.session.activeQuest.id },
                        data: {
                            status: "COMPLETED",
                        }
                    })];
            case 2:
                // Update Quest status in DB
                _b.sent();
                return [4 /*yield*/, (0, reputation_1.awardDignity)(ctx.user.id, 5)];
            case 3:
                _b.sent();
                return [4 /*yield*/, ctx.reply("\uD83C\uDF89 \u041F\u0420\u0410\u0412\u0418\u041B\u042C\u041D\u041E! \u0417\u0430\u0432\u0434\u0430\u043D\u043D\u044F \"".concat(ctx.session.activeQuest.title, "\" \u0432\u0438\u043A\u043E\u043D\u0430\u043D\u043E.\n\uD83D\uDCB0 \u0422\u0432\u0456\u0439 \u0431\u0430\u043B\u0430\u043D\u0441 \u043F\u043E\u043F\u043E\u0432\u043D\u0435\u043D\u043E \u043D\u0430 ").concat(reward, "\u20AC.\n\uD83C\uDFC6 +5 Dignity Score."), keyboards_1.mainMenu)];
            case 4:
                _b.sent();
                delete ctx.session.activeQuest;
                return [2 /*return*/, ctx.scene.leave()];
            case 5: return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, ctx.reply("❌ Невірний код! Попроси клієнта продиктувати правильний код ще раз.")];
            case 7:
                _b.sent();
                _b.label = 8;
            case 8: return [3 /*break*/, 13];
            case 9:
                if (!ctx.session.activeQuest) return [3 /*break*/, 11];
                return [4 /*yield*/, ctx.reply("⌨️ Введи 4-значний код, який тобі сказав клієнт.")];
            case 10:
                _b.sent();
                return [3 /*break*/, 13];
            case 11: 
            // Should usually be handled by enter, but if they text garbage in menu
            return [4 /*yield*/, ctx.reply("Обери замовлення з меню.")];
            case 12:
                // Should usually be handled by enter, but if they text garbage in menu
                _b.sent();
                _b.label = 13;
            case 13: return [2 /*return*/];
        }
    });
}); });
exports.logisticsScene.action("exit_logistics", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.answerCbQuery()];
            case 1:
                _a.sent();
                return [4 /*yield*/, ctx.reply("Повертаємося до головного меню.", keyboards_1.mainMenu)];
            case 2:
                _a.sent();
                return [2 /*return*/, ctx.scene.leave()];
        }
    });
}); });
