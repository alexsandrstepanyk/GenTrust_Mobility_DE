import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./test.db'
    }
  }
});

beforeAll(async () => {
  // Run migrations for test database
  await prisma.$executeRawUnsafe('PRAGMA foreign_keys = ON;');
});

afterEach(async () => {
  // Clean up after each test
  const tablenames = await prisma.$queryRaw<Array<{ name: string }>>`
    SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_prisma_migrations'
  `;

  for (const { name } of tablenames) {
    await prisma.$executeRawUnsafe(`DELETE FROM "${name}";`);
  }
});

afterAll(async () => {
  await prisma.$disconnect();
});
