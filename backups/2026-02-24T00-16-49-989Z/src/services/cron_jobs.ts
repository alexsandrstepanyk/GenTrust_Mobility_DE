import cron from "node-cron";
import { createDailySnapshot, cleanupOldSnapshots } from "./leaderboard_snapshot";

/**
 * Initializes all cron jobs for the system
 */
export const initializeCronJobs = () => {
    // Daily leaderboard snapshot at 00:00
    cron.schedule("0 0 * * *", async () => {
        console.log("[Cron] Running daily leaderboard snapshot...");
        await createDailySnapshot();
    });

    // Daily cleanup of old snapshots at 01:00
    cron.schedule("0 1 * * *", async () => {
        console.log("[Cron] Cleaning up old snapshots...");
        await cleanupOldSnapshots();
    });

    console.log("[Cron] Cron jobs initialized:");
    console.log("  - Daily leaderboard snapshot at 00:00");
    console.log("  - Cleanup old snapshots at 01:00");
};

/**
 * Creates the first snapshot manually (for testing or initialization)
 */
export const createInitialSnapshot = async () => {
    console.log("[Cron] Creating initial snapshot...");
    return await createDailySnapshot();
};
