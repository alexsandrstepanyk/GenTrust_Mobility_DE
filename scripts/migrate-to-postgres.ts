import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// SQLite client
const sqlite = new PrismaClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

// PostgreSQL client
const postgres = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL_POSTGRES || process.env.DATABASE_URL
    }
  }
});

interface MigrationStats {
  users: number;
  quests: number;
  taskOrders: number;
  taskCompletions: number;
  reports: number;
  parentChildRelations: number;
  personalTasks: number;
}

async function migrateToPostgreSQL() {
  console.log('🚀 GenTrust Mobility: SQLite → PostgreSQL Migration');
  console.log('=' .repeat(60));
  console.log('⚠️  WARNING: This will overwrite data in PostgreSQL!');
  console.log('=' .repeat(60));
  
  const stats: MigrationStats = {
    users: 0,
    quests: 0,
    taskOrders: 0,
    taskCompletions: 0,
    reports: 0,
    parentChildRelations: 0,
    personalTasks: 0
  };

  try {
    // 1. Backup SQLite before migration
    console.log('\n📦 Creating SQLite backup...');
    const backupPath = path.join(__dirname, '../backups', `pre-migration-${Date.now()}.db`);
    fs.copyFileSync('./prisma/dev.db', backupPath);
    console.log(`✅ Backup created: ${backupPath}`);

    // 2. Migrate Users
    console.log('\n👥 Migrating Users...');
    const users = await sqlite.user.findMany();
    for (const user of users) {
      await postgres.user.upsert({
        where: { id: user.id },
        update: { ...user },
        create: { ...user }
      });
      stats.users++;
    }
    console.log(`✅ ${stats.users} users migrated`);

    // 3. Migrate ParentChild Relations
    console.log('\n👨‍👩‍👧 Migrating Parent-Child Relations...');
    const parentChildRelations = await (sqlite as any).parentChild.findMany();
    for (const relation of parentChildRelations) {
      await (postgres as any).parentChild.upsert({
        where: { id: relation.id },
        update: { ...relation },
        create: { ...relation }
      });
      stats.parentChildRelations++;
    }
    console.log(`✅ ${stats.parentChildRelations} relations migrated`);

    // 4. Migrate Task Orders
    console.log('\n📋 Migrating Task Orders...');
    const taskOrders = await (sqlite as any).taskOrder.findMany();
    for (const order of taskOrders) {
      await (postgres as any).taskOrder.upsert({
        where: { id: order.id },
        update: { ...order },
        create: { ...order }
      });
      stats.taskOrders++;
    }
    console.log(`✅ ${stats.taskOrders} task orders migrated`);

    // 5. Migrate Quests
    console.log('\n🎯 Migrating Quests...');
    const quests = await (sqlite as any).quest.findMany();
    for (const quest of quests) {
      await (postgres as any).quest.upsert({
        where: { id: quest.id },
        update: { ...quest },
        create: { ...quest }
      });
      stats.quests++;
    }
    console.log(`✅ ${stats.quests} quests migrated`);

    // 6. Migrate Personal Tasks
    console.log('\n👨‍👩‍👧 Migrating Personal Tasks...');
    const personalTasks = await (sqlite as any).personalTask.findMany();
    for (const task of personalTasks) {
      await (postgres as any).personalTask.upsert({
        where: { id: task.id },
        update: { ...task },
        create: { ...task }
      });
      stats.personalTasks++;
    }
    console.log(`✅ ${stats.personalTasks} personal tasks migrated`);

    // 7. Migrate Task Completions
    console.log('\n✅ Migrating Task Completions...');
    const completions = await (sqlite as any).taskCompletion.findMany();
    for (const completion of completions) {
      await (postgres as any).taskCompletion.upsert({
        where: { id: completion.id },
        update: { ...completion },
        create: { ...completion }
      });
      stats.taskCompletions++;
    }
    console.log(`✅ ${stats.taskCompletions} completions migrated`);

    // 8. Migrate Reports
    console.log('\n📝 Migrating Reports...');
    const reports = await (sqlite as any).report.findMany();
    for (const report of reports) {
      await (postgres as any).report.upsert({
        where: { id: report.id },
        update: { ...report },
        create: { ...report }
      });
      stats.reports++;
    }
    console.log(`✅ ${stats.reports} reports migrated`);

    // 9. Verify Migration
    console.log('\n🔍 Verifying migration...');
    const pgUserCount = await postgres.user.count();
    const pgQuestCount = await (postgres as any).quest.count();
    const pgCompletionCount = await (postgres as any).taskCompletion.count();

    if (pgUserCount !== stats.users || pgQuestCount !== stats.quests) {
      throw new Error('Migration verification failed: count mismatch!');
    }

    // 10. Final Report
    console.log('\n' + '='.repeat(60));
    console.log('✅ MIGRATION SUCCESSFUL!');
    console.log('='.repeat(60));
    console.log(`👥 Users: ${stats.users}`);
    console.log(`👨‍👩‍👧 Parent-Child Relations: ${stats.parentChildRelations}`);
    console.log(`📋 Task Orders: ${stats.taskOrders}`);
    console.log(`🎯 Quests: ${stats.quests}`);
    console.log(`👨‍👩‍👧 Personal Tasks: ${stats.personalTasks}`);
    console.log(`✅ Completions: ${stats.taskCompletions}`);
    console.log(`📝 Reports: ${stats.reports}`);
    console.log('='.repeat(60));
    console.log('\n📝 Next Steps:');
    console.log('1. Update .env: DATABASE_URL="<postgres-url>"');
    console.log('2. Update prisma/schema.prisma: provider = "postgresql"');
    console.log('3. Run: npx prisma generate');
    console.log('4. Restart backend');
    console.log('5. Test API endpoints');

  } catch (error) {
    console.error('\n❌ MIGRATION FAILED:', error);
    console.error('\n🔄 Rollback: Use SQLite backup to restore');
    process.exit(1);
  } finally {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  }
}

// Run migration
migrateToPostgreSQL().catch(console.error);
