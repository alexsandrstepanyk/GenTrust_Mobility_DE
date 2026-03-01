# 🗄️ PostgreSQL Migration Plan

**Date:** 1 березня 2026 р.  
**Current:** SQLite (dev.db)  
**Target:** PostgreSQL (Production-ready)

---

## WHY PostgreSQL?

### SQLite Limitations:
- ❌ No concurrent writes (single-writer lock)
- ❌ No built-in replication
- ❌ Limited for production scale (100+ users)
- ❌ No advanced indexing
- ❌ No full-text search

### PostgreSQL Benefits:
- ✅ Multi-client concurrent access
- ✅ ACID compliance
- ✅ Advanced indexing (GIN, GiST for geolocation)
- ✅ Full-text search
- ✅ JSON support for flexible data
- ✅ Battle-tested for production
- ✅ Free tier на Railway/Supabase/Render

---

## Migration Strategy

### Phase 1: Setup PostgreSQL Instance

**Option A: Railway (Recommended)**
```bash
# 1. Create account at railway.app
# 2. New Project → Add PostgreSQL
# 3. Copy connection string
```

**Option B: Supabase**
```bash
# 1. Create project at supabase.com
# 2. Navigate to Database Settings
# 3. Copy connection string
```

**Option C: Local Docker (for testing)**
```bash
docker run --name gentrust-postgres \
  -e POSTGRES_PASSWORD=gentrust2026 \
  -e POSTGRES_DB=gentrust \
  -p 5432:5432 \
  -d postgres:16-alpine
```

### Phase 2: Update Prisma Schema

**Current (.env):**
```env
DATABASE_URL="file:./dev.db"
```

**New (.env.production):**
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

**prisma/schema.prisma:**
```prisma
datasource db {
  provider = "postgresql"  // Changed from "sqlite"
  url      = env("DATABASE_URL")
}
```

### Phase 3: Data Migration

**Export SQLite data:**
```bash
# Install sqlite3 if needed
npm install -g sqlite3

# Export to SQL
sqlite3 prisma/dev.db .dump > backup_sqlite.sql

# Clean up SQLite-specific syntax
sed -i '' 's/AUTOINCREMENT/SERIAL/g' backup_sqlite.sql
sed -i '' 's/INTEGER PRIMARY KEY/SERIAL PRIMARY KEY/g' backup_sqlite.sql
```

**Import to PostgreSQL:**
```bash
# Method 1: Direct import
psql $DATABASE_URL < backup_sqlite.sql

# Method 2: Prisma db push (schema only)
npx prisma db push

# Method 3: Custom migration script
npx ts-node scripts/migrate-to-postgres.ts
```

### Phase 4: Run Prisma Migrations

```bash
# Generate new migration
npx prisma migrate dev --name init_postgres

# Apply to production
npx prisma migrate deploy

# Verify
npx prisma db pull
npx prisma generate
```

---

## Migration Script (Automated)

**scripts/migrate-to-postgres.ts:**

```typescript
import { PrismaClient as SQLiteClient } from '@prisma/client';
import { PrismaClient as PostgresClient } from '@prisma/client';

const sqlite = new SQLiteClient({
  datasource: { url: 'file:./dev.db' }
});

const postgres = new PostgresClient({
  datasource: { url: process.env.DATABASE_URL_POSTGRES }
});

async function migrate() {
  console.log('🚀 Starting migration from SQLite to PostgreSQL...');

  try {
    // 1. Migrate Users
    const users = await sqlite.user.findMany();
    console.log(`📥 Migrating ${users.length} users...`);
    for (const user of users) {
      await postgres.user.upsert({
        where: { id: user.id },
        update: user,
        create: user
      });
    }

    // 2. Migrate Quests
    const quests = await sqlite.quest.findMany();
    console.log(`📥 Migrating ${quests.length} quests...`);
    for (const quest of quests) {
      await postgres.quest.upsert({
        where: { id: quest.id },
        update: quest,
        create: quest
      });
    }

    // 3. Migrate TaskCompletions
    const completions = await sqlite.taskCompletion.findMany();
    console.log(`📥 Migrating ${completions.length} completions...`);
    for (const completion of completions) {
      await postgres.taskCompletion.upsert({
        where: { id: completion.id },
        update: completion,
        create: completion
      });
    }

    // 4. Verify counts
    const userCount = await postgres.user.count();
    const questCount = await postgres.quest.count();
    const completionCount = await postgres.taskCompletion.count();

    console.log('✅ Migration complete!');
    console.log(`  Users: ${userCount}`);
    console.log(`  Quests: ${questCount}`);
    console.log(`  Completions: ${completionCount}`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sqlite.$disconnect();
    await postgres.$disconnect();
  }
}

migrate();
```

---

## Validation Checklist

After migration:

- [ ] **Schema Match**: `npx prisma db pull` shows correct schema
- [ ] **Data Integrity**: All records migrated (count check)
- [ ] **Relationships**: Foreign keys work correctly
- [ ] **App Connectivity**: Backend connects to PostgreSQL
- [ ] **API Tests**: All endpoints return correct data
- [ ] **Performance**: Queries execute in <100ms
- [ ] **Backup Strategy**: Automated daily backups configured

---

## Rollback Plan

If migration fails:

```bash
# 1. Revert .env
DATABASE_URL="file:./dev.db"

# 2. Revert schema.prisma
provider = "sqlite"

# 3. Regenerate client
npx prisma generate

# 4. Restart backend
npm run dev
```

---

## Production Deployment

**Railway:**
```bash
# Install Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link project
railway link

# Set env var
railway variables set DATABASE_URL="postgresql://..."

# Deploy
railway up
```

**Environment Variables:**
```env
# Production
DATABASE_URL="postgresql://user:pass@host:5432/db"
NODE_ENV="production"
PORT=3000

# JWT secret (generate new!)
JWT_SECRET="<generate-random-string>"
```

---

## Cost Analysis

| Provider | Free Tier | Paid Plan |
|----------|-----------|-----------|
| **Railway** | $5/month credit | $0.000463/GB-hour |
| **Supabase** | 500MB database | $25/month (8GB) |
| **Render** | 90 days free | $7/month (1GB) |
| **Heroku** | Deprecated | $5/month |

**Recommendation:** Railway (easiest deployment + generous free tier)

---

## Next Steps

1. Create Railway account
2. Provision PostgreSQL
3. Update .env with connection string
4. Run migration script
5. Test API endpoints
6. Deploy backend to Railway
7. Update mobile app API_URL to production

**Estimated Time:** 2-3 hours

**Risk Level:** Low (we have SQLite backup)

---

**Status:** Ready to execute ✅
