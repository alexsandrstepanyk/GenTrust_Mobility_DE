import bot from "./bot";
import { cityHallBot } from "./city_hall_bot";
import { questProviderBot } from "./quest_provider_bot";
import { masterBot } from "./master_bot";
import { runBackup } from "./backup_manager";

console.log("Starting GenTrust Alpha Bots...");

// Start Master Core Bot (if token exists)
if (masterBot) {
    console.log("🚀 Launching Master Core Bot...");
    masterBot.launch().then(() => {
        console.log("✅ Master Core Bot launched!");
    }).catch(e => console.error("Master Core Bot Error:", e));
}


// Start Backup Cycle (every 30 seconds)
runBackup(); // Run immediately on start
setInterval(runBackup, 30000);
console.log("📦 Backup system active (30s cycle)");

// Start Scout Bot
console.log("🚀 Launching Scout Bot...");
bot.launch().then(() => {
    console.log("✅ Scout Bot launched!");
}).catch(e => console.error("Scout Bot Error:", e));

// Start City Hall Bot (if token exists)
if (cityHallBot) {
    console.log("🚀 Launching City Hall Bot...");
    cityHallBot.launch().then(() => {
        console.log("✅ City Hall Bot launched!");
    }).catch(e => console.error("City Hall Bot Error:", e));
}

// Start Quest Provider Bot (if token exists)
if (questProviderBot) {
    console.log("🚀 Launching Quest Provider Bot...");
    questProviderBot.launch().then(() => {
        console.log("✅ Quest Provider Bot launched!");
    }).catch(e => console.error("Quest Provider Bot Error:", e));
}
