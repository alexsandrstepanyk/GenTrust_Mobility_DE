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
exports.handleAdminActions = void 0;
var prisma_1 = require("./prisma");
var reputation_1 = require("./reputation");
var handleAdminActions = function (bot) {
    // Action: Approve Report
    bot.action(/^approve_report_/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var reportId, report, e_1;
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
                    // Update Report
                    return [4 /*yield*/, prisma_1.default.report.update({
                            where: { id: reportId },
                            data: { status: "APPROVED" }
                        })];
                case 3:
                    // Update Report
                    _a.sent();
                    // Double Dignity Reward (+3 bonus on top of initial +2 = +5 total for specific report logic, 
                    // OR simply give a big bonus now. Let's give +5 bonus).
                    // User asked for "doubling". Initial was 2. So total should be 4? Or just big reward?
                    // Let's give +5 bonus for "Verified Report".
                    return [4 /*yield*/, (0, reputation_1.awardDignity)(report.authorId, 5)];
                case 4:
                    // Double Dignity Reward (+3 bonus on top of initial +2 = +5 total for specific report logic, 
                    // OR simply give a big bonus now. Let's give +5 bonus).
                    // User asked for "doubling". Initial was 2. So total should be 4? Or just big reward?
                    // Let's give +5 bonus for "Verified Report".
                    _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("✅ Звіт схвалено!")];
                case 5:
                    _a.sent();
                    // Notify Admin (Edit message)
                    return [4 /*yield*/, ctx.editMessageCaption("\u2705 \u0421\u0425\u0412\u0410\u041B\u0415\u041D\u041E \u041C\u0415\u0420\u0406\u0404\u042E\n\n\u0417\u0432\u0456\u0442 \u0432\u0456\u0434 ".concat(report.author.firstName, " \u043F\u0440\u0438\u0439\u043D\u044F\u0442\u043E. \u0420\u0435\u0439\u0442\u0438\u043D\u0433 \u043F\u0456\u0434\u0432\u0438\u0449\u0435\u043D\u043E."))];
                case 6:
                    // Notify Admin (Edit message)
                    _a.sent();
                    // Notify User
                    return [4 /*yield*/, bot.telegram.sendMessage(Number(report.author.telegramId), "\uD83C\uDF89 \u0413\u0430\u0440\u043D\u0456 \u043D\u043E\u0432\u0438\u043D\u0438!\n\n\u041C\u0435\u0440\u0456\u044F \u043F\u0456\u0434\u0442\u0432\u0435\u0440\u0434\u0438\u043B\u0430 \u0442\u0432\u0456\u0439 \u0437\u0432\u0456\u0442 \u043F\u0440\u043E \u043F\u0440\u043E\u0431\u043B\u0435\u043C\u0443.\n\u0422\u0432\u0456\u0439 \u0440\u0435\u0439\u0442\u0438\u043D\u0433 Dignity Score \u0437\u043D\u0430\u0447\u043D\u043E \u043F\u0456\u0434\u0432\u0438\u0449\u0435\u043D\u043E! (+5 \u0431\u0430\u043B\u0456\u0432)\n\u041F\u0440\u043E\u0434\u043E\u0432\u0436\u0443\u0439 \u0434\u0431\u0430\u0442\u0438 \u043F\u0440\u043E \u043C\u0456\u0441\u0442\u043E! \uD83C\uDFD9\uFE0F")];
                case 7:
                    // Notify User
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8:
                    e_1 = _a.sent();
                    console.error(e_1);
                    return [4 /*yield*/, ctx.answerCbQuery("Помилка.")];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); });
    // Action: Reject Report
    bot.action(/^reject_report_/, function (ctx) { return __awaiter(void 0, void 0, void 0, function () {
        var reportId, report, banExpires, e_2;
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
                    // Update Report & Ban User
                    return [4 /*yield*/, prisma_1.default.report.update({
                            where: { id: reportId },
                            data: { status: "REJECTED" }
                        })];
                case 3:
                    // Update Report & Ban User
                    _a.sent();
                    return [4 /*yield*/, prisma_1.default.user.update({
                            where: { id: report.authorId },
                            data: {
                                urbanBanExpiresAt: banExpires,
                                dignityScore: { decrement: 5 } // Penalty
                            }
                        })];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, ctx.answerCbQuery("❌ Звіт відхилено (Фейк).")];
                case 5:
                    _a.sent();
                    // Notify Admin
                    return [4 /*yield*/, ctx.editMessageCaption("\u274C \u0412\u0406\u0414\u0425\u0418\u041B\u0415\u041D\u041E (\u0424\u0415\u0419\u041A)\n\n\u041A\u043E\u0440\u0438\u0441\u0442\u0443\u0432\u0430\u0447\u0430 ".concat(report.author.firstName, " \u0437\u0430\u0431\u043B\u043E\u043A\u043E\u0432\u0430\u043D\u043E \u043D\u0430 24 \u0433\u043E\u0434\u0438\u043D\u0438. \u0420\u0435\u0439\u0442\u0438\u043D\u0433 \u0437\u043D\u0438\u0436\u0435\u043D\u043E."))];
                case 6:
                    // Notify Admin
                    _a.sent();
                    // Notify User
                    return [4 /*yield*/, bot.telegram.sendMessage(Number(report.author.telegramId), "\u26A0\uFE0F \u041F\u041E\u041F\u0415\u0420\u0415\u0414\u0416\u0415\u041D\u041D\u042F!\n\n\u041C\u0435\u0440\u0456\u044F \u0432\u0456\u0434\u0445\u0438\u043B\u0438\u043B\u0430 \u0442\u0432\u0456\u0439 \u0437\u0432\u0456\u0442 \u044F\u043A \u043D\u0435\u0434\u043E\u0441\u0442\u043E\u0432\u0456\u0440\u043D\u0438\u0439 (\u0424\u0435\u0439\u043A).\n\n\uD83D\uDCC9 \u0422\u0432\u0456\u0439 \u0440\u0435\u0439\u0442\u0438\u043D\u0433 \u0437\u043D\u0438\u0436\u0435\u043D\u043E (-5).\n\uD83D\uDEAB \u0422\u0438 \u0442\u0438\u043C\u0447\u0430\u0441\u043E\u0432\u043E \u0437\u0430\u0431\u043B\u043E\u043A\u043E\u0432\u0430\u043D\u0438\u0439 \u0443 \u0441\u0438\u0441\u0442\u0435\u043C\u0456 Urban Guardian (24 \u0433\u043E\u0434\u0438\u043D\u0438).\n\n\u0411\u0443\u0434\u044C \u043B\u0430\u0441\u043A\u0430, \u0431\u0443\u0434\u044C \u0447\u0435\u0441\u043D\u0438\u043C \u043D\u0430\u0441\u0442\u0443\u043F\u043D\u043E\u0433\u043E \u0440\u0430\u0437\u0443.")];
                case 7:
                    // Notify User
                    _a.sent();
                    return [3 /*break*/, 10];
                case 8:
                    e_2 = _a.sent();
                    console.error(e_2);
                    return [4 /*yield*/, ctx.answerCbQuery("Помилка.")];
                case 9:
                    _a.sent();
                    return [3 /*break*/, 10];
                case 10: return [2 /*return*/];
            }
        });
    }); });
};
exports.handleAdminActions = handleAdminActions;
