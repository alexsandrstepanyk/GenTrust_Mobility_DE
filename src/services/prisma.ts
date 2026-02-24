// Re-export the prisma client from @prisma/client
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
export default prisma;
