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
var express_1 = require("express");
var prisma_1 = require("../../services/prisma");
var gemini_1 = require("../../services/gemini");
var auth_1 = require("../middleware/auth");
var reputation_1 = require("../../services/reputation");
var life_recorder_1 = require("../../services/life_recorder");
var city_hall_bot_1 = require("../../city_hall_bot");
var telegraf_1 = require("telegraf");
var router = (0, express_1.Router)();
// Submit a report
router.post('/', auth_1.authenticateToken, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, photoBase64, latitude, longitude, description, userCategory, userId, buffer, analysis, category, report, adminChatId, user, isLowPriority, priorityZone, caption, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 8, , 9]);
                _a = req.body, photoBase64 = _a.photoBase64, latitude = _a.latitude, longitude = _a.longitude, description = _a.description, userCategory = _a.category;
                userId = req.user.userId;
                if (!photoBase64 || !latitude || !longitude) {
                    return [2 /*return*/, res.status(400).json({ error: 'Photo and location are required' })];
                }
                buffer = Buffer.from(photoBase64, 'base64');
                return [4 /*yield*/, (0, gemini_1.analyzeImage)(buffer, description)];
            case 1:
                analysis = _b.sent();
                category = userCategory || analysis.category;
                return [4 /*yield*/, prisma_1.default.report.create({
                        data: {
                            authorId: userId,
                            photoId: 'MOBILE_UPLOAD', // We store base64 in session or cloud in real app, here we assume it's processed
                            aiVerdict: JSON.stringify(analysis),
                            category: category,
                            description: description,
                            latitude: latitude,
                            longitude: longitude,
                        }
                    })];
            case 2:
                report = _b.sent();
                return [4 /*yield*/, (0, reputation_1.awardDignity)(userId, 2)];
            case 3:
                _b.sent();
                return [4 /*yield*/, (0, life_recorder_1.recordActivity)(userId, 'REPORT_SUBMITTED', { reportId: report.id, category: category })];
            case 4:
                _b.sent();
                adminChatId = process.env.ADMIN_CHAT_ID;
                if (!(city_hall_bot_1.cityHallBot && adminChatId && adminChatId !== '0')) return [3 /*break*/, 7];
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { id: userId } })];
            case 5:
                user = _b.sent();
                isLowPriority = (user === null || user === void 0 ? void 0 : user.urbanBanExpiresAt) && new Date(user.urbanBanExpiresAt) > new Date();
                priorityZone = isLowPriority ? "🔴 KATEGORIE B" : "🟢 KATEGORIE A";
                caption = "\uD83C\uDFDB\uFE0F MOBILE REPORT (ID: ".concat(report.id.slice(0, 4), ")\n\n").concat(priorityZone, "\n\n\uD83D\uDC64 Autor ID: ").concat(userId.slice(0, 8), "\n\uD83D\uDCC2 Kategorie: ").concat(category, "\n\uD83D\uDCCD Standort: ").concat(latitude, ", ").concat(longitude);
                return [4 /*yield*/, city_hall_bot_1.cityHallBot.telegram.sendPhoto(adminChatId, { source: buffer }, __assign({ caption: caption }, telegraf_1.Markup.inlineKeyboard([
                        [telegraf_1.Markup.button.callback("✅ Bestätigen", "approve_report_".concat(report.id)), telegraf_1.Markup.button.callback("❌ Fake", "reject_report_".concat(report.id))],
                        [telegraf_1.Markup.button.callback("👤 Autor verwalten", "manage_user_".concat(report.authorId))]
                    ])))];
            case 6:
                _b.sent();
                _b.label = 7;
            case 7:
                res.status(201).json({ report: report, beautyResult: analysis });
                return [3 /*break*/, 9];
            case 8:
                error_1 = _b.sent();
                next(error_1);
                return [3 /*break*/, 9];
            case 9: return [2 /*return*/];
        }
    });
}); });
// List user reports
router.get('/my', auth_1.authenticateToken, function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var reports, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, prisma_1.default.report.findMany({
                        where: { authorId: req.user.userId },
                        orderBy: { createdAt: 'desc' }
                    })];
            case 1:
                reports = _a.sent();
                res.json(reports);
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                next(error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
