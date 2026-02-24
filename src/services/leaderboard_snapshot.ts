import prisma from "./prisma";

/**
 * Creates a daily leaderboard snapshot for all users
 */
export const createDailySnapshot = async () => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset time to midnight for consistency

        // Check if a snapshot already exists for today
        const existingSnapshot = await prisma.leaderboardSnapshot.findFirst({
            where: { snapshotDate: today }
        });

        if (existingSnapshot) {
            console.log(`[LeaderboardSnapshot] Snapshot for ${today.toISOString()} already exists`);
            return { success: false, message: "Snapshot already exists" };
        }

        // Fetch all active users ordered by rating
        const users = await prisma.user.findMany({
            where: {
                status: "ACTIVE",
                role: "SCOUT"
            },
            orderBy: {
                dignityScore: "desc"
            },
            select: {
                id: true,
                username: true,
                firstName: true,
                dignityScore: true,
                city: true,
                district: true,
                school: true
            }
        });

        // Create snapshots for each user with their rank
        const snapshots = users.map((user, index) => ({
            userId: user.id,
            username: user.username,
            firstName: user.firstName,
            dignityScore: user.dignityScore,
            city: user.city,
            district: user.district,
            school: user.school,
            rank: index + 1,
            snapshotDate: today
        }));

        await prisma.leaderboardSnapshot.createMany({
            data: snapshots
        });

        console.log(`[LeaderboardSnapshot] Created ${snapshots.length} snapshots for ${today.toISOString()}`);
        return { success: true, count: snapshots.length };
    } catch (error) {
        console.error("[LeaderboardSnapshot] Error creating daily snapshot:", error);
        return { success: false, error };
    }
};

/**
 * Gets leaderboard for a specific date
 */
export const getHistoricalLeaderboard = async (
    date: Date,
    limit = 10,
    filter?: { city?: string; district?: string; school?: string }
) => {
    try {
        date.setHours(0, 0, 0, 0);

        const snapshots = await prisma.leaderboardSnapshot.findMany({
            where: {
                snapshotDate: date,
                city: filter?.city || undefined,
                district: filter?.district || undefined,
                school: filter?.school || undefined
            },
            orderBy: {
                rank: "asc"
            },
            take: limit
        });

        return snapshots;
    } catch (error) {
        console.error("[LeaderboardSnapshot] Error fetching historical leaderboard:", error);
        return [];
    }
};

/**
 * Gets aggregated leaderboard for the last month
 */
export const getMonthlyLeaderboard = async (
    limit = 10,
    filter?: { city?: string; district?: string; school?: string }
) => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        // Fetch all snapshots for the last 30 days
        const snapshots = await prisma.leaderboardSnapshot.findMany({
            where: {
                snapshotDate: { gte: thirtyDaysAgo },
                city: filter?.city || undefined,
                district: filter?.district || undefined,
                school: filter?.school || undefined
            }
        });

        // Aggregate data per user
        const userStats = new Map<string, {
            userId: string;
            username: string | null;
            firstName: string | null;
            city: string | null;
            district: string | null;
            school: string | null;
            totalScore: number;
            appearances: number;
            avgRank: number;
        }>();

        snapshots.forEach(snapshot => {
            const existing = userStats.get(snapshot.userId);
            if (existing) {
                existing.totalScore += snapshot.dignityScore;
                existing.appearances += 1;
                existing.avgRank = (existing.avgRank + snapshot.rank) / 2;
            } else {
                userStats.set(snapshot.userId, {
                    userId: snapshot.userId,
                    username: snapshot.username,
                    firstName: snapshot.firstName,
                    city: snapshot.city,
                    district: snapshot.district,
                    school: snapshot.school,
                    totalScore: snapshot.dignityScore,
                    appearances: 1,
                    avgRank: snapshot.rank
                });
            }
        });

        // Sort by average rank
        const sorted = Array.from(userStats.values())
            .sort((a, b) => a.avgRank - b.avgRank)
            .slice(0, limit);

        return sorted;
    } catch (error) {
        console.error("[LeaderboardSnapshot] Error fetching monthly leaderboard:", error);
        return [];
    }
};

/**
 * Deletes snapshots older than 30 days
 */
export const cleanupOldSnapshots = async () => {
    try {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);

        const result = await prisma.leaderboardSnapshot.deleteMany({
            where: {
                snapshotDate: { lt: thirtyDaysAgo }
            }
        });

        console.log(`[LeaderboardSnapshot] Cleaned up ${result.count} old snapshots`);
        return result.count;
    } catch (error) {
        console.error("[LeaderboardSnapshot] Error cleaning up old snapshots:", error);
        return 0;
    }
};

/**
 * Gets a user's rank change compared to the previous day
 */
export const getUserRankChange = async (userId: string): Promise<number> => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        const [todaySnapshot, yesterdaySnapshot] = await Promise.all([
            prisma.leaderboardSnapshot.findFirst({
                where: { userId, snapshotDate: today }
            }),
            prisma.leaderboardSnapshot.findFirst({
                where: { userId, snapshotDate: yesterday }
            })
        ]);

        if (!todaySnapshot || !yesterdaySnapshot) return 0;

        // Positive number = improvement (moved up)
        return yesterdaySnapshot.rank - todaySnapshot.rank;
    } catch (error) {
        console.error("[LeaderboardSnapshot] Error getting rank change:", error);
        return 0;
    }
};
