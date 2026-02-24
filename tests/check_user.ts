
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();
async function main() {
    const user = await prisma.user.findFirst({
        where: { telegramId: BigInt(312248641) }
    });
    console.log("User in DB:", JSON.stringify(user, (key, value) => typeof value === 'bigint' ? value.toString() : value, 2));
}
main().finally(() => prisma.$disconnect());
