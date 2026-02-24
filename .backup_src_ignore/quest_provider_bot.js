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
exports.questProviderBot = void 0;
var telegraf_1 = require("telegraf");
var dotenv_1 = require("dotenv");
var prisma_1 = require("./services/prisma");
dotenv_1.default.config();
var token = process.env.QUEST_PROVIDER_BOT_TOKEN;
if (!token) {
    console.warn("QUEST_PROVIDER_BOT_TOKEN not set. Quest Provider Bot disabled.");
}
// 1. АВТОРІЗАЦІЯ ПРОВАЙДЕРА
var authProvider = function (ctx, next) { return __awaiter(void 0, void 0, void 0, function () {
    var tid, provider;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                tid = (_a = ctx.from) === null || _a === void 0 ? void 0 : _a.id;
                if (!tid)
                    return [2 /*return*/];
                return [4 /*yield*/, prisma_1.default.provider.findUnique({
                        where: { telegramId: BigInt(tid) }
                    })];
            case 1:
                provider = _b.sent();
                ctx.provider = provider;
                return [2 /*return*/, next()];
        }
    });
}); };
// 2. СЦЕНА РЕЄСТРАЦІЇ ПРОВАЙДЕРА
var providerOnboarding = new telegraf_1.Scenes.WizardScene("provider_onboarding", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.reply("👋 Вітаємо в GenTrust! Щоб почати замовляти доставки, заповніть, будь ласка, коротку анкету.\n\nЯк називається ваша компанія/магазин?")];
            case 1:
                _a.sent();
                ctx.session.onboarding = {};
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (ctx.session.onboarding)
                    ctx.session.onboarding.name = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                return [4 /*yield*/, ctx.reply("🏢 Оберіть тип вашого бізнесу (напр. Аптека, Ресторан, Школа):")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (ctx.session.onboarding)
                    ctx.session.onboarding.type = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                return [4 /*yield*/, ctx.reply("🏙️ В якому місті ви працюєте?")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var d, provider, masterBotToken, masterBot, adminChatId, adminMsg;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                if (ctx.session.onboarding)
                    ctx.session.onboarding.city = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                d = ctx.session.onboarding;
                return [4 /*yield*/, prisma_1.default.provider.create({
                        data: {
                            telegramId: BigInt(((_b = ctx.from) === null || _b === void 0 ? void 0 : _b.id) || 0),
                            name: (d === null || d === void 0 ? void 0 : d.name) || "Новий Бізнес",
                            type: (d === null || d === void 0 ? void 0 : d.type) || "BUSINESS",
                            city: d === null || d === void 0 ? void 0 : d.city,
                            status: "PENDING"
                        }
                    })];
            case 1:
                provider = _e.sent();
                ctx.provider = provider;
                masterBotToken = process.env.CITY_HALL_BOT_TOKEN;
                masterBot = new telegraf_1.Telegraf(masterBotToken || "");
                adminChatId = process.env.ADMIN_CHAT_ID;
                if (!adminChatId) return [3 /*break*/, 3];
                adminMsg = "\uD83C\uDD95 **\u041D\u043E\u0432\u0430 \u0437\u0430\u044F\u0432\u043A\u0430 \u041F\u0420\u041E\u0412\u0410\u0419\u0414\u0415\u0420\u0410!**\n\n\uD83C\uDFE2 \u041D\u0430\u0437\u0432\u0430: ".concat(d === null || d === void 0 ? void 0 : d.name, "\n\uD83D\uDEE0\uFE0F \u0422\u0438\u043F: ").concat(d === null || d === void 0 ? void 0 : d.type, "\n\uD83C\uDFD9\uFE0F \u041C\u0456\u0441\u0442\u043E: ").concat(d === null || d === void 0 ? void 0 : d.city, "\n\uD83D\uDC64 \u042E\u0437\u0435\u0440: @").concat(((_c = ctx.from) === null || _c === void 0 ? void 0 : _c.username) || ((_d = ctx.from) === null || _d === void 0 ? void 0 : _d.id), "\n\n\u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0434\u0456\u044E \u0443 Master Bot:");
                return [4 /*yield*/, masterBot.telegram.sendMessage(adminChatId, adminMsg, __assign({ parse_mode: "Markdown" }, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("✅ Схвалити", "approve_provider_".concat(provider.id))],
                        [telegraf_1.Markup.button.callback("❌ Відхилити", "reject_provider_".concat(provider.id))]
                    ])))];
            case 2:
                _e.sent();
                _e.label = 3;
            case 3: return [4 /*yield*/, ctx.reply("✅ Дякуємо! Ваша заявка надіслана на модерацію в **System Core**. Ми сповістимо вас, як тільки її перевірять.")];
            case 4:
                _e.sent();
                return [2 /*return*/, ctx.scene.leave()];
        }
    });
}); });
// 2. СЦЕНА ВЕРИФІКАЦІЇ ВИДАЧІ
var pickupVerification = new telegraf_1.Scenes.WizardScene("pickup_verification", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.reply("🤝 **Передача замовлення кур'єру**\n\nБудь ласка, введіть 4-значний КОД ВИДАЧІ, який вам назвав скаут:", __assign({ parse_mode: "Markdown" }, telegraf_1.Markup.keyboard([["❌ Скасувати"]]).resize()))];
            case 1:
                _a.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var code, quest;
    var _a, _b, _c, _d;
    return __generator(this, function (_e) {
        switch (_e.label) {
            case 0:
                code = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                if (!(code === "❌ Скасувати")) return [3 /*break*/, 2];
                return [4 /*yield*/, ctx.reply("Скасовано.")];
            case 1:
                _e.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 2:
                if (!/^\d{4}$/.test(code)) {
                    return [2 /*return*/, ctx.reply("❌ Будь ласка, введіть рівно 4 цифри або натисніть 'Скасувати'.")];
                }
                return [4 /*yield*/, prisma_1.default.quest.findFirst({
                        where: {
                            providerId: (_b = ctx.provider) === null || _b === void 0 ? void 0 : _b.id,
                            pickupCode: code,
                            status: "IN_PROGRESS"
                        },
                        include: { assignee: true }
                    })];
            case 3:
                quest = _e.sent();
                if (!quest) {
                    return [2 /*return*/, ctx.reply("❌ Замовлення з таким кодом не знайдено (або воно вже видане/не активоване). Спробуйте ще раз або перевірте код.")];
                }
                ctx.session.verifyingQuestId = quest.id;
                return [4 /*yield*/, ctx.reply("\uD83D\uDD0D **\u0417\u043D\u0430\u0439\u0434\u0435\u043D\u043E \u0437\u0430\u043C\u043E\u0432\u043B\u0435\u043D\u043D\u044F!**\n\n\uD83D\uDCCC \u041D\u0430\u0437\u0432\u0430: ".concat(quest.title, "\n\uD83D\uDCB0 \u0412\u0438\u043D\u0430\u0433\u043E\u0440\u043E\u0434\u0430: ").concat(quest.reward, "\u20AC\n\uD83D\uDC64 \u041A\u0443\u0440'\u0454\u0440: ").concat(((_c = quest.assignee) === null || _c === void 0 ? void 0 : _c.firstName) || ((_d = quest.assignee) === null || _d === void 0 ? void 0 : _d.username) || "Невідомо", "\n\n\u0412\u0438 \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0436\u0443\u0454\u0442\u0435 \u043F\u0435\u0440\u0435\u0434\u0430\u0447\u0443 \u0442\u043E\u0432\u0430\u0440\u0443 \u0446\u044C\u043E\u043C\u0443 \u043A\u0443\u0440'\u0454\u0440\u0443?"), telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("✅ Так, передав товар", "confirm_handover")],
                        [telegraf_1.Markup.button.callback("❌ Ні, помилка", "cancel_handover")]
                    ]))];
            case 4:
                _e.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var cb, qid;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                cb = (_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data;
                qid = ctx.session.verifyingQuestId;
                if (!(cb === "confirm_handover")) return [3 /*break*/, 4];
                return [4 /*yield*/, prisma_1.default.quest.update({
                        where: { id: qid },
                        data: { pickupCode: "PICKED__UP" }
                    })];
            case 1:
                _b.sent();
                return [4 /*yield*/, ctx.reply("✅ Готoво! Видачу підтверджено. Тепер скаут має доставити товар клієнту.")];
            case 2:
                _b.sent();
                return [4 /*yield*/, ctx.answerCbQuery()];
            case 3:
                _b.sent();
                return [3 /*break*/, 6];
            case 4: return [4 /*yield*/, ctx.reply("❌ Видачу скасовано.")];
            case 5:
                _b.sent();
                _b.label = 6;
            case 6: return [2 /*return*/, ctx.scene.leave()];
        }
    });
}); });
// 3. СЦЕНА СТВОРЕННЯ КВЕСТУ
var questConstructor = new telegraf_1.Scenes.WizardScene("quest_constructor", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.reply("📂 Оберіть тип завдання:", telegraf_1.Markup.inlineKeyboard([
                    [telegraf_1.Markup.button.callback("📦 Доставка", "type_LOGISTICS")],
                    [telegraf_1.Markup.button.callback("🛠️ Робота/Допомога", "type_WORK")],
                    [telegraf_1.Markup.button.callback("🌟 Волонтерство", "type_VOLUNTEER")]
                ]))];
            case 1:
                _a.sent();
                ctx.session.providerData = {};
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var cb;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                cb = (_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data;
                if (!cb || !cb.startsWith("type_"))
                    return [2 /*return*/, ctx.reply("Будь ласка, оберіть тип зі списку.")];
                if (ctx.session.providerData)
                    ctx.session.providerData.type = cb.replace("type_", "");
                return [4 /*yield*/, ctx.answerCbQuery()];
            case 1:
                _b.sent();
                return [4 /*yield*/, ctx.reply("📝 Введіть назву завдання (напр. Доставка піци, Прибирання листя):")];
            case 2:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (ctx.session.providerData)
                    ctx.session.providerData.title = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                return [4 /*yield*/, ctx.reply("📄 Опишіть детально умови та що саме потрібно зробити:")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (ctx.session.providerData)
                    ctx.session.providerData.description = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                return [4 /*yield*/, ctx.reply("💰 Яка винагорода (бали/євро)? Введіть тільки число:")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var reward;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                reward = parseFloat((_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text);
                if (isNaN(reward))
                    return [2 /*return*/, ctx.reply("Будь ласка, введіть число.")];
                if (ctx.session.providerData)
                    ctx.session.providerData.reward = reward;
                return [4 /*yield*/, ctx.reply("🏙️ В якому місті це потрібно зробити? (напр. Würzburg, Київ)")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (ctx.session.providerData)
                    ctx.session.providerData.city = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                return [4 /*yield*/, ctx.reply("🏠 Введіть район або конкретну адресу:")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var d;
    var _a;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (ctx.session.providerData)
                    ctx.session.providerData.district = (_a = ctx.message) === null || _a === void 0 ? void 0 : _a.text;
                d = ctx.session.providerData;
                return [4 /*yield*/, ctx.reply("\uD83D\uDD0D **\u041F\u0415\u0420\u0415\u0412\u0406\u0420\u041A\u0410 \u0417\u0410\u0412\u0414\u0410\u041D\u041D\u042F**\n\n\uD83D\uDDC2\uFE0F \u0422\u0438\u043F: ".concat(d === null || d === void 0 ? void 0 : d.type, "\n\uD83D\uDCCC \u041D\u0430\u0437\u0432\u0430: ").concat(d === null || d === void 0 ? void 0 : d.title, "\n\uD83D\uDCDD \u041E\u043F\u0438\u0441: ").concat(d === null || d === void 0 ? void 0 : d.description, "\n\uD83D\uDCB0 \u0412\u0438\u043D\u0430\u0433\u043E\u0440\u043E\u0434\u0430: ").concat(d === null || d === void 0 ? void 0 : d.reward, "\n\uD83D\uDCCD \u041B\u043E\u043A\u0430\u0446\u0456\u044F: ").concat(d === null || d === void 0 ? void 0 : d.city, ", ").concat(d === null || d === void 0 ? void 0 : d.district, "\n\n\u041E\u043F\u0443\u0431\u043B\u0456\u043A\u0443\u0432\u0430\u0442\u0438 \u0437\u0430\u0432\u0434\u0430\u043D\u043D\u044F?"), telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("🚀 Так, опублікувати", "publish_quest")],
                        [telegraf_1.Markup.button.callback("❌ Скасувати", "cancel_quest")]
                    ]))];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var cb, d;
    var _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                cb = (_a = ctx.callbackQuery) === null || _a === void 0 ? void 0 : _a.data;
                if (!(cb === "publish_quest")) return [3 /*break*/, 3];
                d = ctx.session.providerData;
                return [4 /*yield*/, prisma_1.default.quest.create({
                        data: {
                            title: d === null || d === void 0 ? void 0 : d.title,
                            description: d === null || d === void 0 ? void 0 : d.description,
                            reward: d === null || d === void 0 ? void 0 : d.reward,
                            city: d === null || d === void 0 ? void 0 : d.city,
                            district: d === null || d === void 0 ? void 0 : d.district,
                            type: (d === null || d === void 0 ? void 0 : d.type) || "WORK",
                            status: "OPEN",
                            providerId: (_b = ctx.provider) === null || _b === void 0 ? void 0 : _b.id
                        }
                    })];
            case 1:
                _c.sent();
                return [4 /*yield*/, ctx.reply("✅ Завдання успішно додано! Скаути у вашому місті отримають сповіщення.")];
            case 2:
                _c.sent();
                return [3 /*break*/, 5];
            case 3: return [4 /*yield*/, ctx.reply("❌ Створення скасовано.")];
            case 4:
                _c.sent();
                _c.label = 5;
            case 5: return [2 /*return*/, ctx.scene.leave()];
        }
    });
}); });
// 5. БОТ ПРОВАЙДЕРА
exports.questProviderBot = token ? new telegraf_1.Telegraf(token) : null;
if (exports.questProviderBot) {
    var stage = new telegraf_1.Scenes.Stage([providerOnboarding, questConstructor, pickupVerification]);
    exports.questProviderBot.use((0, telegraf_1.session)());
    exports.questProviderBot.use(authProvider);
    exports.questProviderBot.use(stage.middleware());
    exports.questProviderBot.start(function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        return __generator(this, function (_a) {
            if (!ctx.provider) {
                return [2 /*return*/, ctx.scene.enter("provider_onboarding")];
            }
            if (ctx.provider.status === "PENDING") {
                return [2 /*return*/, ctx.reply("⏳ Ваша заявка знаходиться на розгляді у модератора. Ми сповістимо вас, як тільки вона буде схвалена.")];
            }
            if (ctx.provider.status === "REJECTED") {
                return [2 /*return*/, ctx.reply("❌ На жаль, вашу заявку на реєстрацію було відхилено. Зв'яжіться з підтримкою для уточнення деталей.")];
            }
            ctx.reply("\uD83C\uDFE2 **\u041A\u0430\u0431\u0456\u043D\u0435\u0442 \u041F\u0440\u043E\u0432\u0430\u0439\u0434\u0435\u0440\u0430 GenTrust**\n\n\u0412\u0456\u0442\u0430\u0454\u043C\u043E, ".concat(ctx.provider.name, "! \u041E\u0431\u0435\u0440\u0456\u0442\u044C \u0434\u0456\u044E:"), telegraf_1.Markup.keyboard([
                ["➕ Додати нове завдання"],
                ["🤝 Видати замовлення кур'єру"],
                ["📋 Мої активні квести", "📊 Статистика"]
            ]).resize());
            return [2 /*return*/];
        });
    }); });
    exports.questProviderBot.hears("➕ Додати нове завдання", function (ctx) { return ctx.scene.enter("quest_constructor"); });
    exports.questProviderBot.hears("🤝 Видати замовлення кур'єру", function (ctx) { return ctx.scene.enter("pickup_verification"); });
    exports.questProviderBot.hears("📋 Мої активні квести", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var quests, msg;
        var _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0: return [4 /*yield*/, prisma_1.default.quest.findMany({
                        where: { providerId: (_a = ctx.provider) === null || _a === void 0 ? void 0 : _a.id, status: { in: ["OPEN", "IN_PROGRESS"] } },
                        orderBy: { createdAt: 'desc' }
                    })];
                case 1:
                    quests = _b.sent();
                    if (quests.length === 0)
                        return [2 /*return*/, ctx.reply("У вас поки немає активних завдань.")];
                    msg = "📋 **Ваші активні завдання:**\n\n";
                    quests.forEach(function (q) {
                        var icon = q.status === "OPEN" ? "🟢" : "🟡";
                        var codeInfo = q.status === "IN_PROGRESS" ? "\n\uD83D\uDD11 \u041E\u0447\u0456\u043A\u0443\u0432\u0430\u043D\u0438\u0439 \u043A\u043E\u0434: `".concat(q.pickupCode, "`") : "";
                        msg += "".concat(icon, " **").concat(q.title || 'Квест', "**\n\uD83D\uDCB0 ").concat(q.reward, "\u20AC | \uD83D\uDCCD ").concat(q.city).concat(codeInfo, "\n\n");
                    });
                    ctx.reply(msg, { parse_mode: "Markdown" });
                    return [2 /*return*/];
            }
        });
    }); });
    exports.questProviderBot.hears("📊 Статистика", function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var count, completed;
        var _a, _b;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0: return [4 /*yield*/, prisma_1.default.quest.count({ where: { providerId: (_a = ctx.provider) === null || _a === void 0 ? void 0 : _a.id } })];
                case 1:
                    count = _c.sent();
                    return [4 /*yield*/, prisma_1.default.quest.count({ where: { providerId: (_b = ctx.provider) === null || _b === void 0 ? void 0 : _b.id, status: "COMPLETED" } })];
                case 2:
                    completed = _c.sent();
                    ctx.reply("\uD83D\uDCCA **\u0412\u0430\u0448\u0430 \u0441\u0442\u0430\u0442\u0438\u0441\u0442\u0438\u043A\u0430:**\n\n\u0412\u0441\u044C\u043E\u0433\u043E \u0441\u0442\u0432\u043E\u0440\u0435\u043D\u043E: ".concat(count, "\n\u0412\u0438\u043A\u043E\u043D\u0430\u043D\u043E \u0441\u043A\u0430\u0443\u0442\u0430\u043C\u0438: ").concat(completed, "\n\n\u0414\u044F\u043A\u0443\u0454\u043C\u043E, \u0449\u043E \u0434\u043E\u043F\u043E\u043C\u0430\u0433\u0430\u0454\u0442\u0435 \u043C\u043E\u043B\u043E\u0434\u0456 \u0440\u043E\u0437\u0432\u0438\u0432\u0430\u0442\u0438\u0441\u044F!"), { parse_mode: "Markdown" });
                    return [2 /*return*/];
            }
        });
    }); });
    console.log("[Quest Provider Bot] Initialized.");
}
