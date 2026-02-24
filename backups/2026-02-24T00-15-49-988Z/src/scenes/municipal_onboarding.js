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
exports.municipalOnboardingScene = void 0;
var telegraf_1 = require("telegraf");
var prisma_1 = require("../services/prisma");
var messenger_1 = require("../services/messenger");
exports.municipalOnboardingScene = new telegraf_1.Scenes.WizardScene("municipal_onboarding", 
// Schritt 1: Name
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, ctx.reply("👋 Wie heißen Sie? (Vor- und Nachname)")];
            case 1:
                _a.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Schritt 2: Telefon
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var fullName, _a, firstName, lastNameParts;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!ctx.message || !("text" in ctx.message)) {
                    return [2 /*return*/, ctx.reply("❌ Bitte geben Sie Ihren Namen als Text ein.")];
                }
                fullName = ctx.message.text.trim();
                _a = fullName.split(" "), firstName = _a[0], lastNameParts = _a.slice(1);
                ctx.wizard.state.firstName = firstName;
                ctx.wizard.state.lastName = lastNameParts.join(" ");
                return [4 /*yield*/, ctx.reply("📞 Geben Sie Ihre Telefonnummer ein:")];
            case 1:
                _b.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Schritt 3: Abteilung
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!ctx.message || !("text" in ctx.message)) {
                    return [2 /*return*/, ctx.reply("❌ Bitte geben Sie die Telefonnummer ein.")];
                }
                ctx.wizard.state.phone = ctx.message.text.trim();
                return [4 /*yield*/, ctx.reply("🏢 Wählen Sie Ihre Abteilung:", telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("🚧 Straßen", "dept_roads")],
                        [telegraf_1.Markup.button.callback("🗑️ Müll", "dept_waste")],
                        [telegraf_1.Markup.button.callback("💡 Beleuchtung", "dept_lighting")],
                        [telegraf_1.Markup.button.callback("🌳 Parks", "dept_parks")],
                        [telegraf_1.Markup.button.callback("🏗️ Sonstiges", "dept_other")]
                    ]))];
            case 1:
                _a.sent();
                return [2 /*return*/, ctx.wizard.next()];
        }
    });
}); }, 
// Schritt 4: Speichern
function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
    var departmentMap, department, state, worker, adminChatId, adminMsg, ok, fallbackOk, err_1, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!ctx.callbackQuery || !("data" in ctx.callbackQuery)) {
                    return [2 /*return*/, ctx.reply("❌ Bitte wählen Sie die Abteilung über die Buttons.")];
                }
                departmentMap = {
                    "dept_roads": "Straßen",
                    "dept_waste": "Müll",
                    "dept_lighting": "Beleuchtung",
                    "dept_parks": "Parks",
                    "dept_other": "Sonstiges"
                };
                department = departmentMap[ctx.callbackQuery.data];
                state = ctx.wizard.state;
                _a.label = 1;
            case 1:
                _a.trys.push([1, 11, , 13]);
                return [4 /*yield*/, prisma_1.default.municipalWorker.create({
                        data: {
                            telegramId: BigInt(ctx.from.id),
                            firstName: state.firstName,
                            lastName: state.lastName,
                            phone: state.phone,
                            department: department,
                            status: "PENDING"
                        }
                    })];
            case 2:
                worker = _a.sent();
                adminChatId = process.env.ADMIN_CHAT_ID;
                if (!adminChatId) return [3 /*break*/, 8];
                adminMsg = "\uD83C\uDFD7\uFE0F **Neue Bewerbung f\u00FCr den KOMMUNALDIENST!**\n\n\uD83D\uDC64 ".concat(worker.firstName, " ").concat(worker.lastName || "", "\n\uD83D\uDCDE ").concat(worker.phone, "\n\uD83C\uDFE2 Abteilung: ").concat(worker.department, "\n\uD83D\uDC64 ID: ").concat(worker.id, "\n\nW\u00E4hlen Sie eine Aktion:");
                _a.label = 3;
            case 3:
                _a.trys.push([3, 7, , 8]);
                return [4 /*yield*/, messenger_1.messengerHub.sendToAdmin(Number(adminChatId), adminMsg, {
                        reply_markup: telegraf_1.Markup.inlineKeyboard([
                            [telegraf_1.Markup.button.callback("✅ Genehmigen", "approve_municipal_".concat(worker.id))],
                            [telegraf_1.Markup.button.callback("❌ Ablehnen", "reject_municipal_".concat(worker.id))]
                        ]).reply_markup
                    })];
            case 4:
                ok = _a.sent();
                console.log("[Municipal Onboarding] Notification to admin ".concat(adminChatId, " sent: ").concat(ok));
                if (!!ok) return [3 /*break*/, 6];
                console.warn("[Municipal Onboarding] sendToAdmin failed, trying Master Bot fallback");
                return [4 /*yield*/, messenger_1.messengerHub.sendToMaster(Number(adminChatId), adminMsg, {
                        reply_markup: telegraf_1.Markup.inlineKeyboard([
                            [telegraf_1.Markup.button.callback("✅ Genehmigen", "approve_municipal_".concat(worker.id))],
                            [telegraf_1.Markup.button.callback("❌ Ablehnen", "reject_municipal_".concat(worker.id))]
                        ]).reply_markup
                    })];
            case 5:
                fallbackOk = _a.sent();
                console.log("[Municipal Onboarding] Fallback to Master Bot sent: ".concat(fallbackOk));
                _a.label = 6;
            case 6: return [3 /*break*/, 8];
            case 7:
                err_1 = _a.sent();
                console.error("[Municipal Onboarding] Failed to notify admin:", err_1);
                return [3 /*break*/, 8];
            case 8: return [4 /*yield*/, ctx.answerCbQuery()];
            case 9:
                _a.sent();
                return [4 /*yield*/, ctx.reply("\u2705 Danke f\u00FCr die Registrierung!\n\n" +
                        "\uD83D\uDC64 ".concat(state.firstName, " ").concat(state.lastName || "", "\n") +
                        "\uD83D\uDCDE ".concat(state.phone, "\n") +
                        "\uD83C\uDFE2 Abteilung: ".concat(department, "\n\n") +
                        "\u23F3 Ihr Antrag wurde zur Pr\u00FCfung gesendet. Bitte warten Sie auf die Genehmigung durch den Administrator.")];
            case 10:
                _a.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 11:
                error_1 = _a.sent();
                console.error("[Municipal Onboarding] Error:", error_1);
                return [4 /*yield*/, ctx.reply("❌ Fehler bei der Registrierung. Bitte versuchen Sie es später erneut.")];
            case 12:
                _a.sent();
                return [2 /*return*/, ctx.scene.leave()];
            case 13: return [2 /*return*/];
        }
    });
}); });
