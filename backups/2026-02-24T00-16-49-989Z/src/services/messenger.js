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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.messengerHub = void 0;
/**
 * MessengerHub centralizes communication across multiple Telegram bot instances.
 * This allows one bot (e.g., Master Bot) to send notifications through another bot (e.g., Scout Bot)
 * to ensure users receive messages from the bot they are actually interacting with.
 */
var MessengerHub = /** @class */ (function () {
    function MessengerHub() {
        this.bots = {};
        this.pending = {};
    }
    /**
     * Register a bot instance with a friendly name.
     */
    MessengerHub.prototype.registerBot = function (name, bot) {
        this.bots[name] = bot;
        console.log("[MessengerHub] Registered bot: ".concat(name));
        this.flushPending(name).catch(function (err) {
            console.error("[MessengerHub] Failed to flush pending messages for ".concat(name, ":"), err);
        });
    };
    /**
     * Send a message to a Scout (User) via the Scout Bot.
     */
    MessengerHub.prototype.sendToScout = function (telegramId_1, message_1) {
        return __awaiter(this, arguments, void 0, function (telegramId, message, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendMessage("scout", telegramId, message, options)];
            });
        });
    };
    /**
     * Send a message to a Provider via the Quest Provider Bot.
     */
    MessengerHub.prototype.sendToProvider = function (telegramId_1, message_1) {
        return __awaiter(this, arguments, void 0, function (telegramId, message, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendMessage("provider", telegramId, message, options)];
            });
        });
    };
    /**
     * Send a message to an Admin via the City Hall Bot.
     */
    MessengerHub.prototype.sendToAdmin = function (telegramId_1, message_1) {
        return __awaiter(this, arguments, void 0, function (telegramId, message, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendMessage("cityhall", telegramId, message, options)];
            });
        });
    };
    /**
     * Send a message to the Master Admin via the Master Bot.
     */
    MessengerHub.prototype.sendToMaster = function (telegramId_1, message_1) {
        return __awaiter(this, arguments, void 0, function (telegramId, message, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendMessage("master", telegramId, message, options)];
            });
        });
    };
    /**
     * Send a message to a Municipal Worker via the Municipal Bot.
     */
    MessengerHub.prototype.sendToMunicipal = function (telegramId_1, message_1) {
        return __awaiter(this, arguments, void 0, function (telegramId, message, options) {
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                return [2 /*return*/, this.sendMessage("municipal", telegramId, message, options)];
            });
        });
    };
    /**
     * General purpose message sender.
     */
    MessengerHub.prototype.sendMessage = function (botName_1, telegramId_1, message_1) {
        return __awaiter(this, arguments, void 0, function (botName, telegramId, message, options) {
            var bot, error_1;
            if (options === void 0) { options = {}; }
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bot = this.bots[botName];
                        if (!bot) {
                            console.warn("[MessengerHub] Bot '".concat(botName, "' not registered. Message to ").concat(telegramId, " dropped."));
                            if (!this.pending[botName])
                                this.pending[botName] = [];
                            this.pending[botName].push({ telegramId: telegramId, message: message, options: options });
                            return [2 /*return*/, false];
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, bot.telegram.sendMessage(Number(telegramId), message, __assign({ parse_mode: "Markdown" }, options))];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, true];
                    case 3:
                        error_1 = _a.sent();
                        console.error("[MessengerHub] Failed to send message via ".concat(botName, " to ").concat(telegramId, ":"), error_1);
                        return [2 /*return*/, false];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    MessengerHub.prototype.flushPending = function (botName) {
        return __awaiter(this, void 0, void 0, function () {
            var bot, queue, pendingItems, _i, pendingItems_1, item, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        bot = this.bots[botName];
                        queue = this.pending[botName];
                        if (!bot || !queue || queue.length === 0)
                            return [2 /*return*/];
                        pendingItems = __spreadArray([], queue, true);
                        this.pending[botName] = [];
                        _i = 0, pendingItems_1 = pendingItems;
                        _a.label = 1;
                    case 1:
                        if (!(_i < pendingItems_1.length)) return [3 /*break*/, 6];
                        item = pendingItems_1[_i];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, bot.telegram.sendMessage(Number(item.telegramId), item.message, __assign({ parse_mode: "Markdown" }, item.options))];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        console.error("[MessengerHub] Failed to send pending message via ".concat(botName, " to ").concat(item.telegramId, ":"), error_2);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    return MessengerHub;
}());
exports.messengerHub = new MessengerHub();
