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
exports.cityHallBot = void 0;
var telegraf_1 = require("telegraf");
var dotenv_1 = require("dotenv");
var prisma_1 = require("./services/prisma");
var bot_1 = require("./bot"); // Import Scout Bot to notify users
var reputation_1 = require("./services/reputation");
var keyboards_1 = require("./keyboards");
dotenv_1.default.config();
var token = process.env.CITY_HALL_BOT_TOKEN;
if (!token) {
    console.warn("CITY_HALL_BOT_TOKEN not set. City Hall features will be disabled.");
}
// Create City Hall Bot
exports.cityHallBot = token ? new telegraf_1.Telegraf(token) : null;
// Admin Logic
if (exports.cityHallBot) {
    exports.cityHallBot.use((0, telegraf_1.session)());
    // --- ADMIN ONBOARDING SCENE ---
    var adminOnboarding = new telegraf_1.Scenes.WizardScene("admin_onboarding", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.reply("🏛️ Вітаємо в системі Мерії GenTrust! Виконується вхід для працівника.\n\nБудь ласка, введіть ваше ПІБ:")];
                case 1:
                    _a.sent();
                    ctx.session.adminData = {};
                    return [2 /*return*/, ctx.wizard.next()];
            }
        });
    }); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    ctx.session.adminData.fullName = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                    return [4 /*yield*/, ctx.reply("🏙️ В якому місті ви працюєте?")];
                case 1:
                    _b.sent();
                    return [2 /*return*/, ctx.wizard.next()];
            }
        });
    }); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var d, user, masterBotToken, masterBot, rootAdminChatId, adminMsg;
        var _a, _b, _c;
        return __generator(this, function (_d) {
            switch (_d.label) {
                case 0:
                    ctx.session.adminData.city = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                    d = ctx.session.adminData;
                    return [4 /*yield*/, prisma_1.default.user.upsert({
                            where: { telegramId: BigInt(((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id) || 0) },
                            update: { role: "ADMIN", status: "PENDING", firstName: d.fullName, city: d.city },
                            create: { telegramId: BigInt(((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.id) || 0), role: "ADMIN", status: "PENDING", firstName: d.fullName, city: d.city }
                        })];
                case 1:
                    user = _d.sent();
                    masterBotToken = process.env.CITY_HALL_BOT_TOKEN;
                    masterBot = new telegraf_1.Telegraf(masterBotToken || "");
                    rootAdminChatId = process.env.ADMIN_CHAT_ID;
                    if (!rootAdminChatId) return [3 /*break*/, 3];
                    adminMsg = "\uD83C\uDD95 **\u041D\u043E\u0432\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u041C\u0415\u0420\u0406\u0407 (Admin)!**\n\n\uD83D\uDC64 ".concat(d.fullName, "\n\uD83C\uDFD9\uFE0F ").concat(d.city, "\n\uD83D\uDC64 ID: ").concat(user.id, "\n\n\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0434\u0456\u044E \u0443 Master Bot:");
                    return [4 /*yield*/, masterBot.telegram.sendMessage(rootAdminChatId, adminMsg, __assign({ parse_mode: "Markdown" }, telegraf_1.Markup.inlineKeyboard([
                            [telegraf_1.Markup.button.callback("✅ Схвалити Адміна", "approve_user_".concat(user.id))],
                            [telegraf_1.Markup.button.callback("❌ Відхилити", "reject_user_".concat(user.id))]
                        ])))];
                case 2:
                    _d.sent();
                    _d.label = 3;
                case 3: return [4 /*yield*/, ctx.reply("✅ Вашу заявку на доступ до Мерії надіслано до **System Core**. Очікуйте на підтвердження.")];
                case 4:
                    _d.sent();
                    return [2 /*return*/, ctx.scene.leave()];
            }
        });
    }); });
    var stage = new telegraf_1.Scenes.Stage([adminOnboarding]);
    exports.cityHallBot.use(stage.middleware());
    exports.cityHallBot.start(function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var user;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { telegramId: BigInt(((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) || 0) } })];
                case 1:
                    user = _b.sent();
                    if (!user || user.role !== "ADMIN" || user.status !== "ACTIVE") {
                        if ((user === null || user === void 0 ? void 0 : user.status) === "PENDING") {
                            return [2 /*return*/, ctx.reply("⏳ Ваша заявка на модерації у Master Bot. Будь ласка, зачекайте.")];
                        }
                        return [2 /*return*/, ctx.scene.enter("admin_onboarding")];
                    }
                    ctx.reply("\uD83C\uDFDB\uFE0F \u0412\u0456\u0442\u0430\u044E \u0432 \u041C\u0435\u0440\u0456\u0457, \u0410\u0434\u043C\u0456\u043D\u0435 ".concat(user.firstName, "!"), keyboards_1.adminMenu);
                    return [2 /*return*/];
            }
        });
    }); });
    // Helper to view reports by Priority and Category
    var viewReports_1 = function (ctx, priority, subCategory) { return __awaiter(void 0, void 0, void 0, function () {
        var now, reports, _i, reports_1, report, priorityText, caption;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    now = new Date();
                    return [4 /*yield*/, prisma_1.default.report.findMany({
                            where: {
                                status: "PENDING",
                                // @ts-ignore
                                category: subCategory || undefined,
                                author: priority === 'A'
                                    ? { OR: [{ urbanBanExpiresAt: null }, { urbanBanExpiresAt: { lt: now } }] }
                                    : { urbanBanExpiresAt: { gt: now } }
                            },
                            include: { author: true },
                            take: 5 // Limit to avoid flood
                        })];
                case 1:
                    reports = _a.sent();
                    if (reports.length === 0) {
                        return [2 /*return*/, ctx.reply("\uD83D\uDCED \u041D\u0435\u043C\u0430\u0454 \u043D\u043E\u0432\u0438\u0445 \u0437\u0432\u0456\u0442\u0456\u0432 \u0443 \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0457 ".concat(priority).concat(subCategory ? " (".concat(subCategory, ")") : "", "."), keyboards_1.adminMenu)];
                    }
                    return [4 /*yield*/, ctx.reply("\uD83D\uDD0D \u041E\u0441\u0442\u0430\u043D\u043D\u0456 5 \u0437\u0432\u0456\u0442\u0456\u0432 (\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F ".concat(priority).concat(subCategory ? ": ".concat(subCategory) : "", "):"))];
                case 2:
                    _a.sent();
                    _i = 0, reports_1 = reports;
                    _a.label = 3;
                case 3:
                    if (!(_i < reports_1.length)) return [3 /*break*/, 6];
                    report = reports_1[_i];
                    priorityText = priority === 'A' ? "🟢 КАТЕГОРІЯ А" : "🔴 КАТЕГОРІЯ Б";
                    caption = "".concat(priorityText, "\n\n\uD83C\uDD94 ID: ").concat(report.id.slice(0, 4), "\n\uD83D\uDC64 \u0410\u0432\u0442\u043E\u0440 ID: ").concat(report.authorId.slice(0, 8), "\n\uD83D\uDCC2 \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F: ").concat(report.category, "\n\uD83D\uDCDD \u041E\u043F\u0438\u0441: ").concat(report.description || "—", "\n\uD83D\uDCCD \u041B\u043E\u043A\u0430\u0446\u0456\u044F: ").concat(report.latitude, ", ").concat(report.longitude);
                    // We don't have the image buffer here easily without refetching, 
                    // but for simplicity in this flow we send text + buttons.
                    // In a real app, we'd store the image or just resend the photoId if Telegram allows cross-bot (it usually doesn't without re-uploading)
                    return [4 /*yield*/, ctx.reply(caption, telegraf_1.Markup.inlineKeyboard([
                            [telegraf_1.Markup.button.callback("✅ Схвалити", "approve_report_".concat(report.id)), telegraf_1.Markup.button.callback("❌ Відхилити", "reject_report_".concat(report.id))]
                        ]))];
                case 4:
                    // We don't have the image buffer here easily without refetching, 
                    // but for simplicity in this flow we send text + buttons.
                    // In a real app, we'd store the image or just resend the photoId if Telegram allows cross-bot (it usually doesn't without re-uploading)
                    _a.sent();
                    _a.label = 5;
                case 5:
                    _i++;
                    return [3 /*break*/, 3];
                case 6: return [2 /*return*/];
            }
        });
    }); };
    // Category A/B Handlers (Session for filtering)
    exports.cityHallBot.hears("🟢 Категорія А", function (ctx) {
        // @ts-ignore
        ctx.session = { filterPriority: 'A' };
        ctx.reply("Виберіть тип проблеми для Категорії А:", keyboards_1.categoryFilterMenu);
    });
    exports.cityHallBot.hears("🔴 Категорія Б", function (ctx) {
        // @ts-ignore
        ctx.session = { filterPriority: 'B' };
        ctx.reply("Виберіть тип проблеми для Категорії Б:", keyboards_1.categoryFilterMenu);
    });
    exports.cityHallBot.action(/^filter_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var sub, priority;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    sub = ctx.match[1];
                    if (sub === 'back')
                        return [2 /*return*/, ctx.editMessageText("Вибір скасовано.", keyboards_1.adminMenu)];
                    priority = ((_a = ctx.session) === null || _a === void 0 ? void 0 : _a.filterPriority) || 'A';
                    return [4 /*yield*/, ctx.answerCbQuery("\u0428\u0443\u043A\u0430\u044E: ".concat(sub))];
                case 1:
                    _b.sent();
                    return [4 /*yield*/, viewReports_1(ctx, priority, sub)];
                case 2:
                    _b.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    // --- ADVANCED USER MANAGEMENT ---
    exports.cityHallBot.action(/^manage_user_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var userId, user, isPriorA, priorityText, info, e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    userId = ctx.match[1];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 6]);
                    return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { id: userId } })];
                case 2:
                    user = _a.sent();
                    if (!user)
                        return [2 /*return*/, ctx.answerCbQuery("Користувача не знайдено.")];
                    isPriorA = !user.urbanBanExpiresAt || new Date(user.urbanBanExpiresAt) < new Date();
                    priorityText = isPriorA ? "🟢 КАТЕГОРІЯ А (Надійний)" : "🔴 КАТЕГОРІЯ Б (Помилки)";
                    info = "\uD83D\uDC64 **\u041A\u0430\u0440\u0442\u043A\u0430 \u0421\u043A\u0430\u0443\u0442\u0430**\n            \n\uD83C\uDD94 ID: `".concat(user.id, "`\n\uD83D\uDCDD \u041F\u0406\u0411: ").concat(user.firstName || "—", " ").concat(user.lastName || "—", "\n\uD83D\uDCCD \u0420\u0430\u0439\u043E\u043D: ").concat(user.district || "—", "\n\uD83C\uDFC6 \u0420\u0435\u0439\u0442\u0438\u043D\u0433: ").concat(user.dignityScore, "\n\uD83D\uDCCA \u0421\u0442\u0430\u0442\u0443\u0441: ").concat(priorityText, "\n\n\u0412\u0438\u0431\u0435\u0440\u0456\u0442\u044C \u0434\u0456\u044E:");
                    return [4 /*yield*/, ctx.reply(info, __assign({ parse_mode: "Markdown" }, telegraf_1.Markup.inlineKeyboard([
                            [telegraf_1.Markup.button.callback("🟢 Зробити Пріоритет А", "set_prior_A_".concat(user.id))],
                            [telegraf_1.Markup.button.callback("🔴 Перевести в Пріоритет Б", "set_prior_B_".concat(user.id))],
                            [telegraf_1.Markup.button.callback("👥 Список скаутів", "back_to_settings")]
                        ])))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery()];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 6];
                case 5:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [3 /*break*/, 6];
                case 6: return [2 /*return*/];
            }
        });
    }); });
    exports.cityHallBot.action("back_to_settings", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var recentUsers, msg, buttons, _i, recentUsers_1, u, isPriorA, tag;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, ctx.answerCbQuery()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.default.user.findMany({
                            where: { role: "SCOUT" },
                            orderBy: { updatedAt: 'desc' },
                            take: 10
                        })];
                case 2:
                    recentUsers = _a.sent();
                    msg = "⚙️ **Керування Скаутами (Останні активні)**\n\nВиберіть користувача для дій:";
                    buttons = [];
                    for (_i = 0, recentUsers_1 = recentUsers; _i < recentUsers_1.length; _i++) {
                        u = recentUsers_1[_i];
                        isPriorA = !u.urbanBanExpiresAt || new Date(u.urbanBanExpiresAt) < new Date();
                        tag = isPriorA ? "🟢" : "🔴";
                        buttons.push([telegraf_1.Markup.button.callback("".concat(tag, " ").concat(u.firstName || u.username || u.id.slice(0, 4)), "manage_user_".concat(u.id))]);
                    }
                    buttons.push([telegraf_1.Markup.button.callback("🔍 Пошук за ID (Інфо)", "settings_info")]);
                    return [4 /*yield*/, ctx.editMessageText(msg, __assign({ parse_mode: "Markdown" }, telegraf_1.Markup.inlineKeyboard(buttons)))];
                case 3:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    exports.cityHallBot.action(/^set_prior_(A|B)_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var type, userId, banDate, e_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    type = ctx.match[1];
                    userId = ctx.match[2];
                    banDate = type === 'B' ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null;
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 7]);
                    return [4 /*yield*/, prisma_1.default.user.update({
                            where: { id: userId },
                            data: { urbanBanExpiresAt: banDate }
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("\u0421\u043A\u0430\u0443\u0442\u0430 \u043F\u0435\u0440\u0435\u0432\u0435\u0434\u0435\u043D\u043E \u0432 \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044E ".concat(type))];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, ctx.reply("\u2705 \u0421\u0442\u0430\u0442\u0443\u0441 \u043E\u043D\u043E\u0432\u043B\u0435\u043D\u043E: \u0421\u043A\u0430\u0443\u0442 \u0442\u0435\u043F\u0435\u0440 \u0443 \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0457 ".concat(type === 'A' ? 'A (Зелена)' : 'Б (Червона)', "."), keyboards_1.adminMenu)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    e_2 = _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("Помилка.")];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    // Settings Menu - Now with Recent Scouts
    exports.cityHallBot.hears("🏢 Мої налаштування", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var recentUsers, msg, buttons, _i, recentUsers_2, u, isPriorA, tag;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, prisma_1.default.user.findMany({
                        where: { role: "SCOUT" },
                        orderBy: { updatedAt: 'desc' },
                        take: 10
                    })];
                case 1:
                    recentUsers = _a.sent();
                    msg = "⚙️ **Керування Скаутами (Останні активні)**\n\nВиберіть користувача для перегляду його ID та дій:";
                    buttons = [];
                    for (_i = 0, recentUsers_2 = recentUsers; _i < recentUsers_2.length; _i++) {
                        u = recentUsers_2[_i];
                        isPriorA = !u.urbanBanExpiresAt || new Date(u.urbanBanExpiresAt) < new Date();
                        tag = isPriorA ? "🟢" : "🔴";
                        buttons.push([telegraf_1.Markup.button.callback("".concat(tag, " ").concat(u.firstName || u.username || u.id.slice(0, 4)), "manage_user_".concat(u.id))]);
                    }
                    buttons.push([telegraf_1.Markup.button.callback("🔍 Пошук за ID (Інфо)", "settings_info")]);
                    return [4 /*yield*/, ctx.reply(msg, __assign({ parse_mode: "Markdown" }, telegraf_1.Markup.inlineKeyboard(buttons)))];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); });
    exports.cityHallBot.action("settings_info", function (ctx) { return ctx.reply("Для пошуку та дій за ID використовуйте:\n`/ban ID` - в Категорію Б\n`/unban ID` - в Категорію А", { parse_mode: "Markdown" }); });
    exports.cityHallBot.command("ban", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var id, banExpires, result, e_3;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = ctx.message.text.split(' ')[1];
                    if (!id)
                        return [2 /*return*/, ctx.reply("Вкажіть ID скаута.")];
                    banExpires = new Date();
                    banExpires.setDate(banExpires.getDate() + 1); // 24h
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, prisma_1.default.user.updateMany({
                            where: { id: { startsWith: id } },
                            data: { urbanBanExpiresAt: banExpires }
                        })];
                case 2:
                    result = _a.sent();
                    if (result.count > 0)
                        ctx.reply("\uD83D\uDEAB \u0421\u043A\u0430\u0443\u0442\u0430 ".concat(id, " \u043F\u0435\u0440\u0435\u0432\u0435\u0434\u0435\u043D\u043E \u0432 \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044E \u0411 \u043D\u0430 24 \u0433\u043E\u0434\u0438\u043D\u0438."));
                    else
                        ctx.reply("Користувача не знайдено.");
                    return [3 /*break*/, 4];
                case 3:
                    e_3 = _a.sent();
                    ctx.reply("Помилка. Перевірте ID.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    exports.cityHallBot.command("unban", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var id, result, e_4;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    id = ctx.message.text.split(' ')[1];
                    if (!id)
                        return [2 /*return*/, ctx.reply("Вкажіть ID скаута.")];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, prisma_1.default.user.updateMany({
                            where: { id: { startsWith: id } },
                            data: { urbanBanExpiresAt: null }
                        })];
                case 2:
                    result = _a.sent();
                    if (result.count > 0)
                        ctx.reply("\u2705 \u0421\u043A\u0430\u0443\u0442\u0430 ".concat(id, " \u043F\u043E\u043C\u0438\u043B\u0443\u0432\u0430\u043D\u043E. \u0422\u0435\u043F\u0435\u0440 \u0432\u0456\u043D \u0443 \u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u0457 \u0410."));
                    else
                        ctx.reply("Користувача не знайдено.");
                    return [3 /*break*/, 4];
                case 3:
                    e_4 = _a.sent();
                    ctx.reply("Помилка. Перевірте ID.");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); });
    // Stats Logic
    var showStats = function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var stats, emojiMap_1, message_1, e_5;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 5]);
                    return [4 /*yield*/, prisma_1.default.report.groupBy({
                            by: ['category'],
                            _count: { id: true },
                            where: { status: "APPROVED" }
                        })];
                case 1:
                    stats = _a.sent();
                    emojiMap_1 = {
                        "Roads": "🛣️", "Lighting": "💡", "Waste": "🗑️", "Parks": "🌳",
                        "Vandalism": "🎨", "Water": "🚰", "Vehicles": "🚗", "Other": "❓"
                    };
                    message_1 = "📊 **Аналітика міста (Схвалені звіти):**\n\n";
                    stats.forEach(function (s) {
                        var emoji = emojiMap_1[s.category || ""] || "📋";
                        message_1 += "".concat(emoji, " ").concat(s.category || "Інше", ": ").concat(s._count.id, " \u0448\u0442.\n");
                    });
                    if (stats.length === 0)
                        message_1 = "📭 Поки що немає схвалених звітів.";
                    return [4 /*yield*/, ctx.reply(message_1, __assign({ parse_mode: "Markdown" }, keyboards_1.adminMenu))];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 3:
                    e_5 = _a.sent();
                    console.error(e_5);
                    return [4 /*yield*/, ctx.reply("❌ Помилка при отриманні статистики.", keyboards_1.adminMenu)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 5];
                case 5: return [2 /*return*/];
            }
        });
    }); };
    exports.cityHallBot.command("stats", showStats);
    exports.cityHallBot.hears("📊 Статистика", showStats);
    exports.cityHallBot.hears("📋 Нові звіти", function (ctx) {
        ctx.reply("🔍 Очікуйте нових звітів у цьому чаті. Кожен звіт буде містити фото, категорію та локацію.", keyboards_1.adminMenu);
    });
    // Action: Approve Report
    exports.cityHallBot.action(/^approve_report_/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var reportId, report, e_6;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reportId = ctx.match.input.split('_')[2];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 10]);
                    return [4 /*yield*/, prisma_1.default.report.findUnique({ where: { id: reportId }, include: { author: true } })];
                case 2:
                    report = _a.sent();
                    if (!report)
                        return [2 /*return*/, ctx.answerCbQuery("Звіт не знайдено.")];
                    if (report.status !== "PENDING")
                        return [2 /*return*/, ctx.answerCbQuery("Звіт вже оброблено.")];
                    return [4 /*yield*/, prisma_1.default.report.update({
                            where: { id: reportId },
                            data: { status: "APPROVED" }
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, (0, reputation_1.awardDignity)(report.authorId, 5)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("✅ Звіт схвалено!")];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, ctx.editMessageCaption("\u2705 \u0421\u0425\u0412\u0410\u041B\u0415\u041D\u041E\n\n\u0417\u0432\u0456\u0442 \u0432\u0456\u0434 \u0421\u043A\u0430\u0443\u0442\u0430 ID: ".concat(report.authorId.slice(0, 8), " \u043F\u0440\u0438\u0439\u043D\u044F\u0442\u043E.\n\u0420\u0435\u0439\u0442\u0438\u043D\u0433 \u043F\u0456\u0434\u0432\u0438\u0449\u0435\u043D\u043E \u043D\u0430 +5."))];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, bot_1.default.telegram.sendMessage(Number(report.author.telegramId), "\uD83C\uDF89 \u041C\u0435\u0440\u0456\u044F \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043B\u0430 \u0442\u0432\u0456\u0439 \u0437\u0432\u0456\u0442!\n\n\u0414\u044F\u043A\u0443\u0454\u043C\u043E \u0437\u0430 \u0434\u043E\u043F\u043E\u043C\u043E\u0433\u0443 \u043C\u0456\u0441\u0442\u0443. \n\uD83D\uDCC8 \u0422\u0432\u0456\u0439 \u0440\u0435\u0439\u0442\u0438\u043D\u0433 \u043F\u0456\u0434\u0432\u0438\u0449\u0435\u043D\u043E (+5 \u0431\u0430\u043B\u0456\u0432).\n\u0413\u0430\u0440\u043D\u043E\u0433\u043E \u0434\u043D\u044F! \u2600\uFE0F")];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8:
                    e_6 = _a.sent();
                    console.error(e_6);
                    return [4 /*yield*/, ctx.answerCbQuery("Помилка.")];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); });
    // Action: Reject Report
    exports.cityHallBot.action(/^reject_report_/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var reportId, report, banExpires, e_7;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    reportId = ctx.match.input.split('_')[2];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 8, , 10]);
                    return [4 /*yield*/, prisma_1.default.report.findUnique({ where: { id: reportId }, include: { author: true } })];
                case 2:
                    report = _a.sent();
                    if (!report)
                        return [2 /*return*/, ctx.answerCbQuery("Звіт не знайдено.")];
                    if (report.status !== "PENDING")
                        return [2 /*return*/, ctx.answerCbQuery("Звіт вже оброблено.")];
                    banExpires = new Date();
                    banExpires.setDate(banExpires.getDate() + 1);
                    return [4 /*yield*/, prisma_1.default.report.update({
                            where: { id: reportId },
                            data: { status: "REJECTED" }
                        })];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, prisma_1.default.user.update({
                            where: { id: report.authorId },
                            data: {
                                urbanBanExpiresAt: banExpires,
                                dignityScore: { decrement: 5 }
                            }
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("❌ Звіт відхилено.")];
                case 5:
                    _a.sent();
                    return [4 /*yield*/, ctx.editMessageCaption("\u274C \u0412\u0406\u0414\u0425\u0418\u041B\u0415\u041D\u041E (\u0424\u0415\u0419\u041A)\n\n\u0421\u043A\u0430\u0443\u0442\u0430 ID: ".concat(report.authorId.slice(0, 8), " \u043F\u0435\u0440\u0435\u0432\u0435\u0434\u0435\u043D\u043E \u0432 \u041A\u0410\u0422\u0415\u0413\u041E\u0420\u0406\u042E \u0411 \u043D\u0430 24 \u0433\u043E\u0434\u0438\u043D\u0438."))];
                case 6:
                    _a.sent();
                    return [4 /*yield*/, bot_1.default.telegram.sendMessage(Number(report.author.telegramId), "\u26A0\uFE0F \u0422\u0432\u0456\u0439 \u0437\u0432\u0456\u0442 \u0432\u0456\u0434\u0445\u0438\u043B\u0435\u043D\u043E \u041C\u0435\u0440\u0456\u0454\u044E \u044F\u043A \u043D\u0435\u0434\u043E\u0441\u0442\u043E\u0432\u0456\u0440\u043D\u0438\u0439.\n\n\uD83D\uDCC9 \u0420\u0435\u0439\u0442\u0438\u043D\u0433 \u0437\u043D\u0438\u0436\u0435\u043D\u043E (-5).\n\uD83D\uDD34 \u0422\u0432\u043E\u0457 \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u0456 \u0437\u0432\u0456\u0442\u0438 \u043F\u0440\u043E\u0442\u044F\u0433\u043E\u043C 24 \u0433\u043E\u0434\u0438\u043D \u0431\u0443\u0434\u0443\u0442\u044C \u043F\u043E\u0437\u043D\u0430\u0447\u0430\u0442\u0438\u0441\u044F \u044F\u043A \"\u041D\u0438\u0437\u044C\u043A\u0438\u0439 \u043F\u0440\u0456\u043E\u0440\u0438\u0442\u0435\u0442\" (\u041A\u0430\u0442\u0435\u0433\u043E\u0440\u0456\u044F \u0411). \u0411\u0443\u0434\u044C \u043B\u0430\u0441\u043A\u0430, \u043D\u0430\u0434\u0441\u0438\u043B\u0430\u0439 \u0442\u0456\u043B\u044C\u043A\u0438 \u043F\u0440\u0430\u0432\u0434\u0438\u0432\u0443 \u0456\u043D\u0444\u043E\u0440\u043C\u0430\u0446\u0456\u044E!")];
                case 7:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8:
                    e_7 = _a.sent();
                    console.error(e_7);
                    return [4 /*yield*/, ctx.answerCbQuery("Помилка.")];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); });
    // --- PROVIDER MODERATION ---
    exports.cityHallBot.action(/^approve_provider_(\d+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var providerTid, e_8;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    providerTid = ctx.match[1];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 7]);
                    return [4 /*yield*/, prisma_1.default.provider.update({
                            where: { telegramId: BigInt(providerTid) },
                            data: { status: "ACTIVE" }
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("✅ Провайдера схвалено!")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, ctx.editMessageText(ctx.callbackQuery.message.text + "\n\n✅ **СХВАЛЕНО**", { parse_mode: "Markdown" })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    e_8 = _a.sent();
                    console.error(e_8);
                    return [4 /*yield*/, ctx.answerCbQuery("Помилка БД.")];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
    exports.cityHallBot.action(/^reject_provider_(\d+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var providerTid, e_9;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    providerTid = ctx.match[1];
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 5, , 7]);
                    return [4 /*yield*/, prisma_1.default.provider.update({
                            where: { telegramId: BigInt(providerTid) },
                            data: { status: "REJECTED" }
                        })];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("❌ Відхилено")];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, ctx.editMessageText(ctx.callbackQuery.message.text + "\n\n❌ **ВІДХИЛЕНО**", { parse_mode: "Markdown" })];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5:
                    e_9 = _a.sent();
                    console.error(e_9);
                    return [4 /*yield*/, ctx.answerCbQuery("Помилка БД.")];
                case 6:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 7: return [2 /*return*/];
            }
        });
    }); });
}
