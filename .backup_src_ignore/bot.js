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
var telegraf_1 = require("telegraf");
var dotenv_1 = require("dotenv");
var auth_1 = require("./middleware/auth");
var safety_1 = require("./middleware/safety");
var onboarding_1 = require("./scenes/onboarding");
var urban_guardian_1 = require("./scenes/urban_guardian");
var logistics_1 = require("./scenes/logistics");
var telegraf_2 = require("telegraf");
var reputation_1 = require("./services/reputation");
var keyboards_1 = require("./keyboards");
dotenv_1.default.config();
var botToken = process.env.BOT_TOKEN;
if (!botToken)
    throw new Error("BOT_TOKEN must be provided!");
var bot = new telegraf_1.Telegraf(botToken);
console.log("[Bot] Initialized.");
bot.use(function (ctx, next) {
    var _a;
    console.log("[Incoming] ".concat(ctx.updateType, " from ").concat(((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id) || 'unknown', " - Text: ").concat(('message' in ctx.update && 'text' in ctx.update.message) ? ctx.update.message.text : 'non-text'));
    return next();
});
var stage = new telegraf_1.Scenes.Stage([onboarding_1.onboardingScene, urban_guardian_1.urbanGuardianScene, logistics_1.logisticsScene]);
bot.use((0, telegraf_1.session)());
bot.use(auth_1.authMiddleware);
bot.use(safety_1.safetyMiddleware);
bot.use(stage.middleware());
bot.catch(function (err, ctx) {
    var _a;
    console.error("[Global Error] Update ".concat(ctx.updateType, " caused error:"), err);
    // Більш детальна помилка для користувача
    if ((_a = err.description) === null || _a === void 0 ? void 0 : _a.includes("wrong file identifier")) {
        ctx.reply("❌ Помилка передачі зображення. Спробуйте надіслати фото ще раз.").catch(console.error);
    }
    else {
        ctx.reply("❌ Сталася внутрішня помилка сервера. Наші інженери вже працюють над цим!").catch(console.error);
    }
});
bot.start(function (ctx) {
    var _a, _b, _c, _d, _e, _f;
    console.log("[Bot] /start command triggered by ".concat((_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id));
    // If not onboarded or missing city/district, enter onboarding
    if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.status) === "PENDING" || !((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.district) || !((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.city)) {
        ctx.scene.enter("onboarding");
        return;
    }
    ctx.reply("\u0412\u0456\u0442\u0430\u044E, ".concat(((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.firstName) || ((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.username) || 'скаут', "! \n\u0422\u0438 \u0432 \u0441\u0438\u0441\u0442\u0435\u043C\u0456 GenTrust Alpha. \u0422\u0432\u0456\u0439 \u0440\u0435\u0439\u0442\u0438\u043D\u0433 \u0434\u043E\u043F\u043E\u043C\u0430\u0433\u0430\u0454 \u043C\u0456\u0441\u0442\u0443 \u0441\u0442\u0430\u0432\u0430\u0442\u0438 \u043A\u0440\u0430\u0449\u0438\u043C. \u2728\n\n\u0412\u0438\u043A\u043E\u0440\u0438\u0441\u0442\u043E\u0432\u0443\u0439 \u043C\u0435\u043D\u044E \u043D\u0438\u0436\u0447\u0435 \u0434\u043B\u044F \u043D\u0430\u0432\u0456\u0433\u0430\u0446\u0456\u0457:"), keyboards_1.mainMenu);
});
// Navigation Handlers
bot.command("report", function (ctx) { return ctx.scene.enter("urban_guardian"); });
// Helper to check if user is allowed to use features
var checkModeration = function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, _b;
    return __generator(this, function (_c) {
        if (((_a = ctx.user) === null || _a === void 0 ? void 0 : _a.status) === "PENDING") {
            return [2 /*return*/, ctx.reply("⏳ Твій профіль на модерації. Дочекайся схвалення від Master Bot.")];
        }
        if (((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.status) === "REJECTED") {
            return [2 /*return*/, ctx.reply("❌ Твій профіль не було схвалено. Звернуся до адміністратора.")];
        }
        return [2 /*return*/, next()];
    });
}); };
bot.hears("📸 Звіт", checkModeration, function (ctx) { return ctx.scene.enter("urban_guardian"); });
bot.hears("🎒 Квести", checkModeration, function (ctx) { return ctx.scene.enter("logistics"); });
bot.hears("🏆 Рейтинг", checkModeration, function (ctx) { return ctx.reply("🏆 **Рейтинг Скаутів**\n\nОберіть масштаб:", __assign({ parse_mode: "Markdown" }, telegraf_2.Markup.inlineKeyboard([
    [telegraf_2.Markup.button.callback("🌍 Загальний ТОП", "rating_global")],
    [telegraf_2.Markup.button.callback("🏙️ Моє Місто", "rating_city"), telegraf_2.Markup.button.callback("🏠 Мій Район", "rating_district")],
    [telegraf_2.Markup.button.callback("🏫 Моя Школа", "rating_school")]
]))); });
// Action Handlers for Ratings
bot.action(/^rating_(.+)/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var type, user, filter, title, top, message, e_1;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                type = ctx.match[1];
                user = ctx.user;
                filter = {};
                title = "Загальний ТОП";
                if (type === "city") {
                    filter = { city: user === null || user === void 0 ? void 0 : user.city };
                    title = "\u0422\u041E\u041F \u041C\u0456\u0441\u0442\u0430: ".concat((user === null || user === void 0 ? void 0 : user.city) || "Невідомо");
                }
                else if (type === "district") {
                    filter = { district: user === null || user === void 0 ? void 0 : user.district };
                    title = "\u0422\u041E\u041F \u0420\u0430\u0439\u043E\u043D\u0443: ".concat((user === null || user === void 0 ? void 0 : user.district) || "Невідомо");
                }
                else if (type === "school") {
                    filter = { school: user === null || user === void 0 ? void 0 : user.school };
                    title = "\u0422\u041E\u041F \u0428\u043A\u043E\u043B\u0438: ".concat((user === null || user === void 0 ? void 0 : user.school) || "Невідомо");
                }
                return [4 /*yield*/, (0, reputation_1.getLeaderboard)(10, filter)];
            case 1:
                top = _b.sent();
                message = "\uD83C\uDFC6 <b>".concat(title, "</b>\n\n");
                top.forEach(function (u, index) {
                    var medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "👤";
                    var name = (u.firstName || u.username || "Анонім").replace(/</g, "&lt;").replace(/>/g, "&gt;");
                    message += "".concat(medal, " ").concat(name, " \u2014 ").concat(u.dignityScore, " \u0431\u0430\u043B\u0456\u0432\n");
                });
                if (top.length === 0)
                    message = "📭 У цій категорії поки порожньо.";
                _b.label = 2;
            case 2:
                _b.trys.push([2, 4, , 5]);
                return [4 /*yield*/, ctx.editMessageText(message, __assign({ parse_mode: "HTML" }, telegraf_2.Markup.inlineKeyboard([[telegraf_2.Markup.button.callback("⬅️ Назад", "rating_back")]])))];
            case 3:
                _b.sent();
                return [3 /*break*/, 5];
            case 4:
                e_1 = _b.sent();
                if ((_a = e_1.description) === null || _a === void 0 ? void 0 : _a.includes("message is not modified"))
                    return [2 /*return*/];
                console.error("[Rating Error]", e_1);
                return [3 /*break*/, 5];
            case 5: return [4 /*yield*/, ctx.answerCbQuery()];
            case 6:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.action("rating_back", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var e_2;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 2, , 3]);
                return [4 /*yield*/, ctx.editMessageText("🏆 **Рейтинг Скаутів**\n\nОбери масштаб рейтингу:", __assign({ parse_mode: "Markdown" }, telegraf_2.Markup.inlineKeyboard([
                        [telegraf_2.Markup.button.callback("🌍 Загальний ТОП", "rating_global")],
                        [telegraf_2.Markup.button.callback("🏙️ Моє Місто", "rating_city"), telegraf_2.Markup.button.callback("🏠 Мій Район", "rating_district")],
                        [telegraf_2.Markup.button.callback("🏫 Моя Школа", "rating_school")]
                    ])))];
            case 1:
                _b.sent();
                return [3 /*break*/, 3];
            case 2:
                e_2 = _b.sent();
                if ((_a = e_2.description) === null || _a === void 0 ? void 0 : _a.includes("message is not modified"))
                    return [2 /*return*/];
                console.error(e_2);
                return [3 /*break*/, 3];
            case 3: return [4 /*yield*/, ctx.answerCbQuery()];
            case 4:
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
bot.command("profile", function (ctx) {
    var _a, _b, _c, _d, _e, _f;
    ctx.reply("\uD83D\uDC64 **\u041C\u0456\u0439 \u041F\u0440\u043E\u0444\u0456\u043B\u044C \u0421\u043A\u0430\u0443\u0442\u0430**\n    \n\uD83C\uDD94 ID: `".concat((_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id.slice(0, 8), "`\n\uD83C\uDFC5 \u0421\u0442\u0430\u0442\u0443\u0441: ").concat((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.status, "\n\uD83C\uDFC6 \u0420\u0435\u0439\u0442\u0438\u043D\u0433: ").concat((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.dignityScore, "\n\uD83C\uDFD9\uFE0F \u041C\u0456\u0441\u0442\u043E: ").concat(((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.city) || "Не визначено", "\n\uD83C\uDFE0 \u0420\u0430\u0439\u043E\u043D: ").concat(((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.district) || "Не визначено", "\n\uD83C\uDFEB \u0428\u043A\u043E\u043B\u0430: ").concat(((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.school) || "Не визначено", "\n"), __assign({ parse_mode: "Markdown" }, keyboards_1.mainMenu));
});
bot.hears("👤 Профіль", function (ctx) {
    var _a, _b, _c, _d, _e, _f;
    ctx.reply("\uD83D\uDC64 **\u041C\u0456\u0439 \u041F\u0440\u043E\u0444\u0456\u043B\u044C \u0421\u043A\u0430\u0443\u0442\u0430**\n    \n\uD83C\uDD94 ID: `".concat((_a = ctx.user) === null || _a === void 0 ? void 0 : _a.id.slice(0, 8), "`\n\uD83C\uDFC5 \u0421\u0442\u0430\u0442\u0443\u0441: ").concat((_b = ctx.user) === null || _b === void 0 ? void 0 : _b.status, "\n\uD83C\uDFC6 \u0420\u0435\u0439\u0442\u0438\u043D\u0433: ").concat((_c = ctx.user) === null || _c === void 0 ? void 0 : _c.dignityScore, "\n\uD83C\uDFD9\uFE0F \u041C\u0456\u0441\u0442\u043E: ").concat(((_d = ctx.user) === null || _d === void 0 ? void 0 : _d.city) || "Не визначено", "\n\uD83C\uDFE0 \u0420\u0430\u0439\u043E\u043D: ").concat(((_e = ctx.user) === null || _e === void 0 ? void 0 : _e.district) || "Не визначено", "\n\uD83C\uDFEB \u0428\u043A\u043E\u043B\u0430: ").concat(((_f = ctx.user) === null || _f === void 0 ? void 0 : _f.school) || "Не визначено", "\n"), __assign({ parse_mode: "Markdown" }, keyboards_1.mainMenu));
});
// JSON serializer for BigInt (Prisma uses BigInt for BigInt fields)
// @ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };
// Graceful stop
process.once('SIGINT', function () { return bot.stop('SIGINT'); });
process.once('SIGTERM', function () { return bot.stop('SIGTERM'); });
exports.default = bot;
