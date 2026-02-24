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
var express_1 = require("express");
var bcryptjs_1 = require("bcryptjs");
var jsonwebtoken_1 = require("jsonwebtoken");
var prisma_1 = require("../../services/prisma");
var router = (0, express_1.Router)();
var JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';
// Register
router.post('/register', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, password, firstName, lastName, city, country, district, language, birthDate, school, grade, normalizedEmail, existingUser, passwordHash, user, token, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 4, , 5]);
                _a = req.body, email = _a.email, password = _a.password, firstName = _a.firstName, lastName = _a.lastName, city = _a.city, country = _a.country, district = _a.district, language = _a.language, birthDate = _a.birthDate, school = _a.school, grade = _a.grade;
                if (!email || !password) {
                    return [2 /*return*/, res.status(400).json({ error: 'Email and password are required' })];
                }
                normalizedEmail = email.trim().toLowerCase();
                console.log("[Auth] Registering user: \"".concat(normalizedEmail, "\" (password length: ").concat(password === null || password === void 0 ? void 0 : password.length, ")"));
                return [4 /*yield*/, prisma_1.default.user.findUnique({ where: { email: normalizedEmail } })];
            case 1:
                existingUser = _b.sent();
                if (existingUser) {
                    return [2 /*return*/, res.status(400).json({ error: 'User already exists' })];
                }
                return [4 /*yield*/, bcryptjs_1.default.hash(password, 10)];
            case 2:
                passwordHash = _b.sent();
                return [4 /*yield*/, prisma_1.default.user.create({
                        data: {
                            email: normalizedEmail,
                            passwordHash: passwordHash,
                            firstName: firstName,
                            lastName: lastName,
                            city: city,
                            district: district,
                            birthDate: birthDate,
                            school: school,
                            grade: grade,
                            language: language || 'uk',
                            country: country || 'DE',
                            status: 'PENDING'
                        }
                    })];
            case 3:
                user = _b.sent();
                token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
                res.status(201).json({ user: user, token: token });
                return [3 /*break*/, 5];
            case 4:
                error_1 = _b.sent();
                next(error_1);
                return [3 /*break*/, 5];
            case 5: return [2 /*return*/];
        }
    });
}); });
// Login
router.post('/login', function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var _a, email, username, password, loginIdentifier, user, isPasswordValid, token, error_2;
    var _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                _c.trys.push([0, 3, , 4]);
                _a = req.body, email = _a.email, username = _a.username, password = _a.password;
                loginIdentifier = (_b = (username || email)) === null || _b === void 0 ? void 0 : _b.trim().toLowerCase();
                console.log("[Auth] Login attempt for: \"".concat(loginIdentifier, "\""));
                return [4 /*yield*/, prisma_1.default.user.findFirst({
                        where: {
                            OR: [
                                { email: loginIdentifier },
                                { username: loginIdentifier }
                            ]
                        }
                    })];
            case 1:
                user = _c.sent();
                if (!user) {
                    console.log("[Auth] User not found: \"".concat(loginIdentifier, "\""));
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid credentials' })];
                }
                if (!user.passwordHash) {
                    console.log("[Auth] User has no password hash: \"".concat(loginIdentifier, "\""));
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid credentials' })];
                }
                return [4 /*yield*/, bcryptjs_1.default.compare(password, user.passwordHash)];
            case 2:
                isPasswordValid = _c.sent();
                if (!isPasswordValid) {
                    console.log("[Auth] Password mismatch for: \"".concat(loginIdentifier, "\""));
                    console.log("[Auth] Input password length: ".concat(password === null || password === void 0 ? void 0 : password.length));
                    console.log("[Auth] Input password starts with: ".concat(password === null || password === void 0 ? void 0 : password.substring(0, 2), "..."));
                    return [2 /*return*/, res.status(401).json({ error: 'Invalid credentials' })];
                }
                console.log("[Auth] Login successful: \"".concat(loginIdentifier, "\""));
                token = jsonwebtoken_1.default.sign({ userId: user.id, role: user.role }, JWT_SECRET, { expiresIn: '7d' });
                res.json({ user: user, token: token });
                return [3 /*break*/, 4];
            case 3:
                error_2 = _c.sent();
                next(error_2);
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); });
exports.default = router;
