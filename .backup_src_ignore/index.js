"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var bot_1 = require("./bot");
var city_hall_bot_1 = require("./city_hall_bot");
var quest_provider_bot_1 = require("./quest_provider_bot");
var master_bot_1 = require("./master_bot");
var backup_manager_1 = require("./backup_manager");
console.log("Starting GenTrust Alpha Bots...");
// Start Master Core Bot (if token exists)
if (master_bot_1.masterBot) {
    console.log("🚀 Launching Master Core Bot...");
    master_bot_1.masterBot.launch().then(function () {
        console.log("✅ Master Core Bot launched!");
    }).catch(function (e) { return console.error("Master Core Bot Error:", e); });
}
// Start Backup Cycle (every 30 seconds)
(0, backup_manager_1.runBackup)(); // Run immediately on start
setInterval(backup_manager_1.runBackup, 30000);
console.log("📦 Backup system active (30s cycle)");
// Start Scout Bot
console.log("🚀 Launching Scout Bot...");
bot_1.default.launch().then(function () {
    console.log("✅ Scout Bot launched!");
}).catch(function (e) { return console.error("Scout Bot Error:", e); });
// Start City Hall Bot (if token exists)
if (city_hall_bot_1.cityHallBot) {
    console.log("🚀 Launching City Hall Bot...");
    city_hall_bot_1.cityHallBot.launch().then(function () {
        console.log("✅ City Hall Bot launched!");
    }).catch(function (e) { return console.error("City Hall Bot Error:", e); });
}
// Start Quest Provider Bot (if token exists)
if (quest_provider_bot_1.questProviderBot) {
    console.log("🚀 Launching Quest Provider Bot...");
    quest_provider_bot_1.questProviderBot.launch().then(function () {
        console.log("✅ Quest Provider Bot launched!");
    }).catch(function (e) { return console.error("Quest Provider Bot Error:", e); });
}
