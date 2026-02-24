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
var bot_1 = require("./bot");
var city_hall_bot_1 = require("./city_hall_bot");
var quest_provider_bot_1 = require("./quest_provider_bot");
var master_bot_1 = require("./master_bot");
var backup_manager_1 = require("./backup_manager");
var messenger_1 = require("./services/messenger");
var cron_jobs_1 = require("./services/cron_jobs");
var municipal_bot_1 = require("./municipal_bot");
var exception_manager_1 = require("./services/exception_manager");
require("./api/server"); // Start API Server
exception_manager_1.default.info("Boot", "Starting GenTrust Alpha Bots...");
console.log("Starting GenTrust Alpha Bots...");
// Helper function to launch bot with error handling (fire-and-forget)
var launchBot = function (botInstance, botName, hubName) {
    // Run in background without waiting
    (function () { return __awaiter(void 0, void 0, void 0, function () {
        var e_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    console.log("\uD83D\uDE80 Launching ".concat(botName, "..."));
                    messenger_1.messengerHub.registerBot(hubName, botInstance);
                    return [4 /*yield*/, botInstance.telegram.deleteWebhook().catch(function () {
                            console.warn("".concat(botName, " webhook delete failed (non-critical)"));
                        })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, botInstance.launch({ dropPendingUpdates: true })];
                case 2:
                    _a.sent();
                    console.log("\u2705 ".concat(botName, " launched and listening!"));
                    return [3 /*break*/, 4];
                case 3:
                    e_1 = _a.sent();
                    console.error("\u274C ".concat(botName, " Error:"), e_1);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    }); })();
};
// Initialize async startup sequence
(function () { return __awaiter(void 0, void 0, void 0, function () {
    return __generator(this, function (_a) {
        try {
            // Initialize Cron Jobs first
            console.log("⚙️  Initializing cron jobs...");
            (0, cron_jobs_1.initializeCronJobs)();
            // Create initial snapshot if needed (non-blocking)
            (0, cron_jobs_1.createInitialSnapshot)().catch(function (e) { return console.error("Initial snapshot error (non-critical):", e); });
            // Run backup asynchronously (non-blocking)
            if (process.env.BACKUP_ON_START === "true") {
                (0, backup_manager_1.runBackup)().catch(function (e) { return console.warn("Backup error (non-critical):", e); });
                console.log("📦 Backup scheduled");
            }
            // Start all bots in parallel (non-blocking fire-and-forget)
            // Start Master Core Bot
            if (master_bot_1.masterBot) {
                launchBot(master_bot_1.masterBot, "Master Core Bot", "master");
            }
            // Start Scout Bot
            launchBot(bot_1.default, "Scout Bot", "scout");
            // Start City Hall Bot
            if (city_hall_bot_1.cityHallBot) {
                launchBot(city_hall_bot_1.cityHallBot, "City Hall Bot", "cityhall");
            }
            // Start Quest Provider Bot
            if (quest_provider_bot_1.questProviderBot) {
                launchBot(quest_provider_bot_1.questProviderBot, "Quest Provider Bot", "provider");
            }
            // Start Municipal Bot
            if (municipal_bot_1.municipalBot) {
                launchBot(municipal_bot_1.municipalBot, "Municipal Services Bot", "municipal");
            }
            console.log("\n✨ All bots startup initiated! They are now listening...");
        }
        catch (e) {
            console.error("Fatal error during startup:", e);
            process.exit(1);
        }
        return [2 /*return*/];
    });
}); })();
