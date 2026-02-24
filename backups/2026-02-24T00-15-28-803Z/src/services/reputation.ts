import prisma from "./prisma";

export const awardDignity = async (userId: string, amount: number) => {
    try {
        const user = await prisma.user.update({
            where: { id: userId },
            data: {
                dignityScore: {
                    increment: amount,
                },
            },
        });
        return user.dignityScore;
    } catch (error) {
        console.error("Error awarding dignity:", error);
        return null;
    }
};

export const getLeaderboard = async (limit = 10, filter?: { city?: string; district?: string; school?: string }) => {
    try {
        return await prisma.user.findMany({
            where: {
                city: filter?.city || undefined,
                district: filter?.district || undefined,
                school: filter?.school || undefined,
            },
            orderBy: {
                dignityScore: "desc",
            },
            take: limit,
            select: {
                username: true,
                firstName: true,
                lastName: true,
                dignityScore: true,
                district: true,
                school: true,
                city: true
            }
        });
    } catch (error) {
        console.error("Error fetching leaderboard:", error);
        return [];
    }
};
