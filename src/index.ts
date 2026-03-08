// import bot from "./bot"; // DISABLED: 2026-03-07 - Prisma errors
// import { cityHallBot } from "./city_hall_bot"; // DISABLED: temporary
import { questProviderBot } from "./quest_provider_bot";
import { masterBot } from "./master_bot";
import { runBackup } from "./backup_manager";
import { messengerHub } from "./services/messenger";
import { initializeCronJobs, createInitialSnapshot } from "./services/cron_jobs";
import { municipalBot } from "./municipal_bot";
import "./api/server"; // Start API Server

// import exceptionManager from "./services/exception_manager";
// exceptionManager.info("Boot", "Starting GenTrust Alpha Bots...");
console.log("Starting GenTrust Alpha Bots...");

// Helper function to launch bot with error handling (fire-and-forget)
const launchBot = (botInstance: any, botName: string, hubName: string) => {
    // Run in background without waiting
    (async () => {
        try {
            console.log(`🚀 Launching ${botName}...`);
            messengerHub.registerBot(hubName, botInstance);
            await botInstance.telegram.deleteWebhook().catch(() => {
                console.warn(`${botName} webhook delete failed (non-critical)`);
            });
            await botInstance.launch({ dropPendingUpdates: true });
            console.log(`✅ ${botName} launched and listening!`);
        } catch (e) {
            console.error(`❌ ${botName} Error:`, e);
        }
    })().catch((err) => {
        console.error(`❌ ${botName} Fatal error:`, err);
    });
};

// Initialize async startup sequence
(async () => {
    try {
        // Initialize Cron Jobs first
        console.log("⚙️  Initializing cron jobs...");
        initializeCronJobs();

        // Create initial snapshot if needed (non-blocking)
        createInitialSnapshot().catch(e => console.error("Initial snapshot error (non-critical):", e));

        // Run backup asynchronously (non-blocking)
        if (process.env.BACKUP_ON_START === "true") {
            runBackup().catch(e => console.warn("Backup error (non-critical):", e));
            console.log("📦 Backup scheduled");
        }

        // Start all bots in parallel (non-blocking fire-and-forget)

        // Start Master Core Bot
        if (masterBot) {
            launchBot(masterBot, "Master Core Bot", "master");
        }

        // Start Scout Bot
        // launchBot(bot, "Scout Bot", "scout"); // DISABLED

        // Start City Hall Bot
        // if (cityHallBot) { // DISABLED
        //     launchBot(cityHallBot, "City Hall Bot", "cityhall");
        // }

        // Start Quest Provider Bot
        if (questProviderBot) {
            launchBot(questProviderBot, "Quest Provider Bot", "provider");
        }

        // Start Municipal Bot
        if (municipalBot) {
            launchBot(municipalBot, "Municipal Services Bot", "municipal");
        }

        console.log("\n✨ All bots startup initiated! They are now listening...");
        
    } catch (e) {
        console.error("Fatal error during startup:", e);
        process.exit(1);
    }
})();