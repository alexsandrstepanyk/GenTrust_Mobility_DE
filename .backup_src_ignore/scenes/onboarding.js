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
exports.onboardingScene = void 0;
var telegraf_1 = require("telegraf");
var prisma_1 = require("../services/prisma");
exports.onboardingScene = new telegraf_1.Scenes.WizardScene("onboarding", 
// Step 1: City
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.reply("👋 Привіт, майбутній Скаут! Давай зареєструємо тебе.\n\nВ якому місті ти проживаєш? (напр. Würzburg, Kyiv)")];
            case 1:
                _a.sent();
                ctx.session.onboarding = {}; // Init session
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 2: District
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var city;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                city = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                if (!city)
                    return [2 /*return*/, ctx.reply("Будь ласка, введи назву міста текстом.")];
                if (ctx.session.onboarding)
                    ctx.session.onboarding.city = city;
                return [4 /*yield*/, ctx.reply("📍 А в якому районі? (напр. Zellerau, Altstadt)")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 3: First Name
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var district;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                district = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                if (!district)
                    return [2 /*return*/, ctx.reply("Будь ласка, введи назву району текстом.")];
                if (ctx.session.onboarding)
                    ctx.session.onboarding.district = district;
                return [4 /*yield*/, ctx.reply("✍️ Як тебе звати? (Ім'я)")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 3: Last Name
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var firstName;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                firstName = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                if (!firstName)
                    return [2 /*return*/, ctx.reply("Введи ім'я текстом.")];
                if (ctx.session.onboarding)
                    ctx.session.onboarding.firstName = firstName;
                return [4 /*yield*/, ctx.reply("✍️ Твоє прізвище?")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 4: Birth Date
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var lastName;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                lastName = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                if (!lastName)
                    return [2 /*return*/, ctx.reply("Введи прізвище текстом.")];
                if (ctx.session.onboarding)
                    ctx.session.onboarding.lastName = lastName;
                return [4 /*yield*/, ctx.reply("📅 Дата народження? (формат: ДД.ММ.РРРР, напр. 12.05.2010)")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 5: School
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var birthDate;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                birthDate = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                // Simple validation could go here
                if (!birthDate)
                    return [2 /*return*/, ctx.reply("Введи дату текстом.")];
                if (ctx.session.onboarding)
                    ctx.session.onboarding.birthDate = birthDate;
                return [4 /*yield*/, ctx.reply("🏫 В якій школі ти навчаєшся?")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 6: Grade
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var school;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                school = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                if (!school)
                    return [2 /*return*/, ctx.reply("Введи назву школи.")];
                if (ctx.session.onboarding)
                    ctx.session.onboarding.school = school;
                return [4 /*yield*/, ctx.reply("🎓 В якому ти класі? (напр. 7-A)")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 7: Final Confirmation and Code of Conduct
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var grade, data;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                grade = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                if (!grade)
                    return [2 /*return*/, ctx.reply("Введи клас.")];
                if (ctx.session.onboarding)
                    ctx.session.onboarding.grade = grade;
                data = ctx.session.onboarding;
                return [4 /*yield*/, ctx.reply("\uD83D\uDD0D \u041F\u0435\u0440\u0435\u0432\u0456\u0440 \u0434\u0430\u043D\u0456:\n      \n\uD83D\uDC65 ".concat(data === null || data === void 0 ? void 0 : data.firstName, " ").concat(data === null || data === void 0 ? void 0 : data.lastName, "\n\uD83D\uDCC5 ").concat(data === null || data === void 0 ? void 0 : data.birthDate, "\n\uD83C\uDFEB ").concat(data === null || data === void 0 ? void 0 : data.school, ", \u041A\u043B\u0430\u0441 ").concat(data === null || data === void 0 ? void 0 : data.grade, "\n\uD83D\uDCCD \u041C\u0456\u0441\u0442\u043E: ").concat(data === null || data === void 0 ? void 0 : data.city, "\n\uD83C\uDFE0 \u0420\u0430\u0439\u043E\u043D: ").concat(data === null || data === void 0 ? void 0 : data.district, "\n\n\uD83D\uDCDC \u041A\u043E\u0434\u0435\u043A\u0441 \u0421\u043A\u0430\u0443\u0442\u0430:\n1. \u042F \u043E\u0431\u0456\u0446\u044F\u044E \u0431\u0443\u0442\u0438 \u0447\u0435\u0441\u043D\u0438\u043C.\n2. \u042F \u0434\u0431\u0430\u044E \u043F\u0440\u043E \u0441\u0432\u043E\u0454 \u043C\u0456\u0441\u0442\u043E.\n3. \u042F \u0434\u043E\u043F\u043E\u043C\u0430\u0433\u0430\u044E \u0456\u043D\u0448\u0438\u043C.\n\n\u0422\u0438 \u043F\u043E\u0433\u043E\u0434\u0436\u0443\u0454\u0448\u0441\u044F \u0456 \u0434\u0430\u043D\u0456 \u0432\u0456\u0440\u043D\u0456?"), telegraf_1.Markup.inlineKeyboard([
                        telegraf_1.Markup.button.callback("✅ Так, реєструюся", "agree_code"),
                        telegraf_1.Markup.button.callback("❌ Ні, почати знову", "restart_onboarding")
                    ]))];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Step 8: Save to DB
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var callbackData, data, updatedUser, masterBotToken, Telegraf, masterBot, adminChatId, adminMsg;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                callbackData = (_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data;
                if (!(callbackData === "restart_onboarding")) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.answerCbQuery("Починаємо спочатку...")];
            case 1:
                _b.sent();
                ctx.scene.enter("onboarding"); // Re-enter
                return [2 /*return*/];
            case 2:
                if (!(callbackData === "agree_code")) return [3 /*break*/, 9];
                return [4 /*yield*/, ctx.answerCbQuery()];
            case 3:
                _b.sent();
                data = ctx.session.onboarding;
                if (!(ctx.user && data)) return [3 /*break*/, 7];
                return [4 /*yield*/, prisma_1.default.user.update({
                        where: { id: ctx.user.id },
                        data: {
                            city: data.city,
                            district: data.district,
                            firstName: data.firstName,
                            lastName: data.lastName,
                            birthDate: data.birthDate,
                            school: data.school,
                            grade: data.grade,
                            status: "PENDING"
                        }
                    })];
            case 4:
                updatedUser = _b.sent();
                // Update context user
                ctx.user = updatedUser;
                masterBotToken = process.env.CITY_HALL_BOT_TOKEN;
                return [4 /*yield*/, Promise.resolve().then(function () { return require("telegraf"); })];
            case 5:
                Telegraf = (_b.sent()).Telegraf;
                masterBot = new Telegraf(masterBotToken || "");
                adminChatId = process.env.ADMIN_CHAT_ID;
                if (!adminChatId) return [3 /*break*/, 7];
                adminMsg = "\uD83C\uDD95 **\u041D\u043E\u0432\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u0421\u041A\u0410\u0423\u0422\u0410!**\n\n\uD83D\uDC64 ".concat(updatedUser.firstName, " ").concat(updatedUser.lastName, "\n\uD83C\uDFD9\uFE0F ").concat(updatedUser.city, " | \uD83C\uDFEB ").concat(updatedUser.school, "\n\uD83D\uDC64 ID: ").concat(updatedUser.id, "\n\n\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0434\u0456\u044E \u0443 Master Bot:");
                return [4 /*yield*/, masterBot.telegram.sendMessage(adminChatId, adminMsg, __assign({ parse_mode: "Markdown" }, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("✅ Схвалити", "approve_user_".concat(updatedUser.id))],
                        [telegraf_1.Markup.button.callback("❌ Відхилити", "reject_user_".concat(updatedUser.id))]
                    ])))];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7: return [4 /*yield*/, ctx.reply("🚀 Твою анкету надіслано на модерацію до **System Core**. \n\nЯк тільки її схвалять, ти отримаєш сповіщення і зможеш почати свою першу місію!")];
            case 8:
                _b.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 9: 
            // If user typed something instead of clicking button
            return [4 /*yield*/, ctx.reply("Будь ласка, натисни кнопку.")];
            case 10:
                // If user typed something instead of clicking button
                _b.sent();
                return [2 /*return*/];
        }
    });
}); });
