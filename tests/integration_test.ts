
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("🚀 Starting Integration Test...");

    // 1. Create Dummy User
    const telegramId = BigInt(Math.floor(Math.random() * 1000000));
    console.log(`Creating test user with ID: ${telegramId}`);

    const user = await prisma.user.create({
        data: {
            telegramId: telegramId,
            username: "test_user",
            firstName: "Test",
            lastName: "User",
            dignityScore: 10,
            role: "SCOUT",
            status: "ACTIVE"
        }
    });
    console.log("✅ User created:", user.id);

    // 2. Create Report (Simulate Urban Guardian)
    console.log("Creating test report...");
    const report = await prisma.report.create({
        data: {
            authorId: user.id,
            photoId: "test_photo_id",
            aiVerdict: JSON.stringify({ is_issue: true, confidence: 0.99, category: "pothole" }),
            latitude: 50.0,
            longitude: 30.0,
            status: "PENDING"
        }
    });
    console.log("✅ Report created:", report.id);

    // 3. Simulate City Hall Approval (Logic from city_hall_bot.ts)
    console.log("Simulating Approval...");

    // Update Report
    await prisma.report.update({
        where: { id: report.id },
        data: { status: "APPROVED" }
    });

    // Reward User
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: { dignityScore: { increment: 5 } }
    });

    console.log("✅ Report approved. New Dignity Score:", updatedUser.dignityScore);

    if (updatedUser.dignityScore === 15) {
        console.log("🎉 SUCCESS: Score updated correctly (10 + 5 = 15).");
    } else {
        console.error("❌ FAILURE: Score mismatch.");
    }

    // 4. Cleanup
    console.log("Cleaning up...");
    await prisma.report.delete({ where: { id: report.id } });
    await prisma.user.delete({ where: { id: user.id } });
    console.log("✅ Cleanup complete.");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
