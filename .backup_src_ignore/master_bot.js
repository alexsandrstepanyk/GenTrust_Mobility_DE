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
exports.masterBot = void 0;
var telegraf_1 = require("telegraf");
var dotenv_1 = require("dotenv");
var prisma_1 = require("./services/prisma");
dotenv_1.default.config();
var token = process.env.MASTER_BOT_TOKEN; // Master Core
var masterBot = token ? new telegraf_1.Telegraf(token) : null;
exports.masterBot = masterBot;
if (masterBot) {
    masterBot.use((0, telegraf_1.session)());
    masterBot.start(function (ctx) {
        ctx.reply("\uD83D\uDC51 **GenTrust System Core**\n\n\u0412\u0456\u0442\u0430\u0454\u043C\u043E, \u0413\u043E\u043B\u043E\u0432\u043D\u0438\u0439 \u0410\u0434\u043C\u0456\u043D\u0456\u0441\u0442\u0440\u0430\u0442\u043E\u0440! \u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0440\u043E\u0437\u0434\u0456\u043B \u043A\u0435\u0440\u0443\u0432\u0430\u043D\u043D\u044F:", telegraf_1.Markup.keyboard([
            ["👥 Підтверджені агенти"],
            ["⏳ Очікують підтвердження"],
            ["🚫 Заблоковані", "📊 Статистика"]
        ]).resize());
    });
    // 1. Очікують підтвердження
    masterBot.hears("⏳ Очікують підтвердження", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var pendingUsers, pendingProviders, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.default.user.findMany({ where: { status: "PENDING" } })];
                case 1:
                    pendingUsers = _a.sent();
                    return [4 /*yield*/, prisma_1.default.provider.findMany({ where: { status: "PENDING" } })];
                case 2:
                    pendingProviders = _a.sent();
                    if (pendingUsers.length === 0 && pendingProviders.length === 0) {
                        return [2 /*return*/, ctx.reply("📭 Немає нових заявок.")];
                    }
                    msg = "⏳ **Нові заявки на реєстрацію:**\n\n";
                    pendingUsers.forEach(function (u) {
                        msg += "\uD83D\uDC64 [\u0421\u041A\u0410\u0423\u0422] ".concat(u.firstName || u.username || u.id.slice(0, 4), "\n/view_user_").concat(u.id, "\n\n");
                    });
                    pendingProviders.forEach(function (p) {
                        msg += "\uD83C\uDFE2 [\u041F\u0420\u041E\u0414] ".concat(p.name, " (").concat(p.city, ")\n/view_provider_").concat(p.id, "\n\n");
                    });
                    ctx.reply(msg);
                    return [2 /*return*/];
            }
        });
    }); });
    // 2. Підтверджені агенти
    masterBot.hears("👥 Підтверджені агенти", function (ctx) {
        ctx.reply("📂 Оберіть групу агентів:", telegraf_1.Markup.inlineKeyboard([
            [telegraf_1.Markup.button.callback("🏛️ Мерії (Admin)", "group_admins")],
            [telegraf_1.Markup.button.callback("🎒 Школярі (Scouts)", "group_scouts")],
            [telegraf_1.Markup.button.callback("🏢 Замовники (Providers)", "group_providers")]
        ]));
    });
    masterBot.action("group_admins", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var admins, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.default.user.findMany({ where: { role: "ADMIN", status: "ACTIVE" } })];
                case 1:
                    admins = _a.sent();
                    msg = "🏛️ **Працівники Мерій (Активні):**\n\n";
                    admins.forEach(function (u) { return msg += "\u2022 ".concat(u.firstName, " ").concat(u.lastName, " | ID: `").concat(u.id.slice(0, 8), "`\n"); });
                    ctx.reply(msg || "Поки немає підтверджених мерій.", { parse_mode: "Markdown" });
                    ctx.answerCbQuery();
                    return [2 /*return*/];
            }
        });
    }); });
    masterBot.action("group_scouts", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var scouts, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.default.user.findMany({ where: { role: "SCOUT", status: "ACTIVE" } })];
                case 1:
                    scouts = _a.sent();
                    msg = "🎒 **Школярі-Скаути (Активні):**\n\n";
                    scouts.forEach(function (u) { return msg += "\u2022 ".concat(u.firstName, " (").concat(u.city || '—', ") | ID: `").concat(u.id.slice(0, 8), "`\n"); });
                    ctx.reply(msg || "Поки немає підтверджених скаутів.", { parse_mode: "Markdown" });
                    ctx.answerCbQuery();
                    return [2 /*return*/];
            }
        });
    }); });
    masterBot.action("group_providers", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var providers, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.default.provider.findMany({ where: { status: "ACTIVE" } })];
                case 1:
                    providers = _a.sent();
                    msg = "🏢 **Замовники / Провайдери (Активні):**\n\n";
                    providers.forEach(function (p) { return msg += "\u2022 ".concat(p.name, " (").concat(p.city, ") | ID: `").concat(p.id.slice(0, 8), "`\n"); });
                    ctx.reply(msg || "Поки немає підтверджених провайдерів.", { parse_mode: "Markdown" });
                    ctx.answerCbQuery();
                    return [2 /*return*/];
            }
        });
    }); });
    // 2.5 Заблоковані
    masterBot.hears("🚫 Заблоковані", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var bannedUsers, bannedProviders, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.default.user.findMany({ where: { status: "BANNED" } })];
                case 1:
                    bannedUsers = _a.sent();
                    return [4 /*yield*/, prisma_1.default.provider.findMany({ where: { status: "BANNED" } })];
                case 2:
                    bannedProviders = _a.sent();
                    msg = "🚫 **Заблоковані об'єкти:**\n\n";
                    bannedUsers.forEach(function (u) { return msg += "\uD83D\uDC64 ".concat(u.firstName, " | ID: `").concat(u.id.slice(0, 8), "`\n"); });
                    bannedProviders.forEach(function (p) { return msg += "\uD83C\uDFE2 ".concat(p.name, " | ID: `").concat(p.id.slice(0, 8), "`\n"); });
                    ctx.reply(msg || "Список порожній.");
                    return [2 /*return*/];
            }
        });
    }); });
    // 3. Статистика
    masterBot.hears("📊 Статистика", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var usersCount, providersCount, questsCount;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.default.user.count()];
                case 1:
                    usersCount = _a.sent();
                    return [4 /*yield*/, prisma_1.default.provider.count()];
                case 2:
                    providersCount = _a.sent();
                    return [4 /*yield*/, prisma_1.default.quest.count({ where: { status: "COMPLETED" } })];
                case 3:
                    questsCount = _a.sent();
                    ctx.reply("\uD83D\uDCCA **\u0413\u043B\u043E\u0431\u0430\u043B\u044C\u043D\u0430 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430 \u043F\u0440\u043E\u0435\u043A\u0442\u0443:**\n\n\uD83D\uDC65 \u0421\u043A\u0430\u0443\u0442\u0456\u0432: ".concat(usersCount, "\n\uD83C\uDFE2 \u041F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0456\u0432: ").concat(providersCount, "\n\u2705 \u0412\u0438\u043A\u043E\u043D\u0430\u043D\u043E \u0437\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u044C: ").concat(questsCount, "\n\nGenTrust Alpha Core v2.0"), { parse_mode: "Markdown" });
                    return [2 /*return*/];
            }
        });
    }); });
    // 4. Детальний перегляд
    masterBot.hears(/^\/view_user_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, user, statusIcon, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = ctx.match[1];
                    return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { id: userId } })];
                case 1:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/, ctx.reply("Користувача не знайдено.")];
                    statusIcon = user.status === "PENDING" ? "⏳" : "✅";
                    msg = "\uD83D\uDC64 **\u0406\u043D\u0444\u043E \u043F\u0440\u043E \u0421\u043A\u0430\u0443\u0442\u0430** ".concat(statusIcon, "\n\n\uD83C\uDD94 ID: `").concat(user.id, "`\n\uD83D\uDCDD \u041F\u0406\u0411: ").concat(user.firstName, " ").concat(user.lastName, "\n\uD83D\uDCC5 \u0414\u0430\u0442\u0430 \u043D\u0430\u0440\u043E\u0434\u0436\u0435\u043D\u043D\u044F: ").concat(user.birthDate, "\n\uD83C\uDFEB \u0428\u043A\u043E\u043B\u0430: ").concat(user.school, ", ").concat(user.grade, " \u043A\u043B\u0430\u0441\n\uD83D\uDCCD \u041C\u0456\u0441\u0442\u043E/\u0420\u0430\u0439\u043E\u043D: ").concat(user.city, ", ").concat(user.district, "\n\uD83D\uDCCA \u0421\u0442\u0430\u0442\u0443\u0441: ").concat(user.status, "\n\n\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0434\u0456\u044E:");
                    ctx.reply(msg, __assign({ parse_mode: "Markdown" }, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("✅ Схвалити", "approve_user_".concat(user.id)), telegraf_1.Markup.button.callback("❌ Відхилити", "reject_user_".concat(user.id))],
                        [telegraf_1.Markup.button.callback("🚫 Заблокувати", "ban_user_".concat(user.id))]
                    ])));
                    return [2 /*return*/];
            }
        });
    }); });
    masterBot.hears(/^\/view_provider_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var providerId, provider, msg;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    providerId = ctx.match[1];
                    return [4 /*yield*/, prisma_1.default.provider.findUnique({ where: { id: providerId } })];
                case 1:
                    provider = _a.sent();
                    if (!provider)
                        return [2 /*return*/, ctx.reply("Провайдера не знайдено.")];
                    msg = "\uD83C\uDFE2 **\u0406\u043D\u0444\u043E \u043F\u0440\u043E \u041F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430**\n\n\uD83C\uDD94 ID: `".concat(provider.id, "`\n\uD83C\uDFE6 \u041D\u0430\u0437\u0432\u0430: ").concat(provider.name, "\n\uD83D\uDEE0\uFE0F \u0422\u0438\u043F: ").concat(provider.type, "\n\uD83C\uDFD9\uFE0F \u041C\u0456\u0441\u0442\u043E: ").concat(provider.city, "\n\uD83D\uDCCA \u0421\u0442\u0430\u0442\u0443\u0441: ").concat(provider.status, "\n\n\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0434\u0456\u044E:");
                    ctx.reply(msg, __assign({ parse_mode: "Markdown" }, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("✅ Схвалити", "approve_provider_".concat(provider.id)), telegraf_1.Markup.button.callback("❌ Відхилити", "reject_provider_".concat(provider.id))],
                        [telegraf_1.Markup.button.callback("🚫 Заблокувати", "ban_provider_".concat(provider.id))]
                    ])));
                    return [2 /*return*/];
            }
        });
    }); });
    // 5. Обробка схвалення (Actions)
    masterBot.action(/^approve_user_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, user, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = ctx.match[1];
                    return [4 /*yield*/, prisma_1.default.user.update({ where: { id: userId }, data: { status: "ACTIVE" } })];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("Користувача підтверджено!")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, ctx.editMessageText("\u2705 \u042E\u0437\u0435\u0440\u0430 **".concat(user.firstName, "** \u0441\u0445\u0432\u0430\u043B\u0435\u043D\u043E!"), { parse_mode: "Markdown" })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, ctx.telegram.sendMessage(Number(user.telegramId), "🎉 Вітаємо! Твій профіль схвалено. Тепер ти можеш користуватися всіма функціями GenTrust Scout!")];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_1 = _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    masterBot.action(/^reject_user_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, user, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = ctx.match[1];
                    return [4 /*yield*/, prisma_1.default.user.update({ where: { id: userId }, data: { status: "REJECTED" } })];
                case 1:
                    user = _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("Заявку відхилено")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, ctx.editMessageText("\u274C \u042E\u0437\u0435\u0440\u0443 **".concat(user.firstName, "** \u0432\u0456\u0434\u043C\u043E\u0432\u043B\u0435\u043D\u043E."), { parse_mode: "Markdown" })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, ctx.telegram.sendMessage(Number(user.telegramId), "❌ На жаль, твій профіль не було схвалено модератором.")];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_2 = _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    masterBot.action(/^approve_provider_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var providerId, provider, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    providerId = ctx.match[1];
                    return [4 /*yield*/, prisma_1.default.provider.update({ where: { id: providerId }, data: { status: "ACTIVE" } })];
                case 1:
                    provider = _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("Провайдера підтверджено!")];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, ctx.editMessageText("\u2705 \u041F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430 **".concat(provider.name, "** \u0441\u0445\u0432\u0430\u043B\u0435\u043D\u043E!"), { parse_mode: "Markdown" })];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4:
                    _a.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, ctx.telegram.sendMessage(Number(provider.telegramId), "🎉 Вітаємо! Вашу компанію схвалено. Тепер ви можете створювати завдання!")];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 6:
                    e_3 = _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    console.log("[Master Bot] Initialized.");
}
