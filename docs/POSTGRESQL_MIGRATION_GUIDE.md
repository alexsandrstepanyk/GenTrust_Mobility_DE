# PostgreSQL Migration Guide

## 📋 Overview

Цей гайд допоможе мігрувати з SQLite на PostgreSQL для production deployment.

---

## 🚀 Варіант 1: Railway (Рекомендовано)

### Крок 1: Створити базу на Railway

1. Зайдіть на [railway.app](https://railway.app)
2. Натисніть "New Project"
3. Оберіть "Provision PostgreSQL"
4. Зачекайте поки база створиться (~30 сек)

### Крок 2: Отримати connection string

1. Відкрийте свій проект
2. Натисніть на змінні середовища (Variables)
3. Скопіюйте `DATABASE_URL` (виглядає як `postgresql://user:password@host.railway.app:5432/dbname`)

### Крок 3: Додати в .env

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
```

Відкрийте `.env` і замініть:

```env
# Було (SQLite)
DATABASE_URL="file:./dev.db"

# Стало (PostgreSQL)
DATABASE_URL="postgresql://postgres:password@host.railway.app:5432/gentrust"
```

### Крок 4: Запустити міграцію

```bash
chmod +x scripts/migrate_to_postgresql.sh
./scripts/migrate_to_postgresql.sh
```

### Крок 5: Перевірити

```bash
# Restart backend
killall node
npm run api

# Check health
curl http://localhost:3000/health
```

---

## 🚀 Варіант 2: Supabase (Free Tier)

### Крок 1: Створити проект

1. Зайдіть на [supabase.com](https://supabase.com)
2. "New Project"
3. Оберіть регіон (Frankfurt для Європи)
4. Встановіть пароль для DB

### Крок 2: Отримати connection string

1. Project Settings → Database
2. "Connection string" → "URI"
3. Скопіюйте та замініть пароль у форматі:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxx.supabase.co:5432/postgres
   ```

### Крок 3: Додати в .env

Аналогічно до Railway (див. вище)

---

## 🚀 Варіант 3: Render.com

### Крок 1: Створити базу

1. Зайдіть на [render.com](https://render.com)
2. "New" → "PostgreSQL"
3. Оберіть free tier (90 днів)

### Крок 2: Connection string

1. Dashboard → ваша база
2. "Internal Database URL"
3. Скопіюйте

---

## 🔧 Ручна міграція (для просунутих)

### 1. Експорт SQLite

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
sqlite3 prisma/dev.db .dump > backup.sql
```

### 2. Встановити PostgreSQL локально

```bash
# macOS
brew install postgresql
brew services start postgresql

# Створити БД
createdb gentrust
```

### 3. Оновити schema.prisma

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

### 4. Запустити міграції

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Seed дані

```bash
npx ts-node scripts/seed_quests.ts
npx ts-node scripts/seed_admin.ts
```

---

## ✅ Перевірка після міграції

### 1. Health Check

```bash
curl http://localhost:3000/health
```

Очікуйте:
```json
{
  "status": "ok",
  "checks": {
    "database": "connected",
    "redis": "configured",
    "cloudinary": "not configured"
  }
}
```

### 2. Перевірка даних

```bash
# Login test
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"testuser@test.com","password":"test123"}'
```

### 3. Quest completion test

```bash
./test_quest_completion.sh
```

---

## 🔙 Rollback (якщо щось пішло не так)

### 1. Відновити SQLite backup

```bash
cp prisma/dev.db.backup.* prisma/dev.db
```

### 2. Відновити schema

```bash
# В schema.prisma змініть назад на sqlite
datasource db {
  provider = "sqlite"
  url      = "file:./dev.db"
}

npx prisma generate
```

### 3. Restart

```bash
killall node
npm run api
```

---

## 📊 Порівняння SQLite vs PostgreSQL

| Характеристика | SQLite | PostgreSQL |
|----------------|--------|------------|
| **Тип** | File-based | Client-Server |
| **Конкурентність** | Low | High |
| **Масштабованість** | Limited | Excellent |
| **Production Ready** | ❌ No | ✅ Yes |
| **Backup** | Manual | Automated |
| **RAM Usage** | ~100MB | ~200MB |
| **Concurrent Users** | 1-10 | 1000+ |

---

## 💡 Поради

### Для розробки
- ✅ Використовуйте SQLite (швидше, простіше)
- ✅ Локальні тести працюють миттєво

### Для production
- ✅ Тільки PostgreSQL
- ✅ Railway/Supabase для хостингу
- ✅ Автоматичні backup щодня
- ✅ Connection pooling (PgBouncer)

### Оптимізація
```prisma
// Додати індекси в schema.prisma
@@index([email])
@@index([role, status])
@@index([city, district])
@@index([createdAt])
```

---

## 🆘 Troubleshooting

### Помилка: "Can't reach database server"

**Причина:** Неправильний DATABASE_URL

**Рішення:**
```bash
# Перевірте .env
cat .env | grep DATABASE_URL

# Протестуйте з'єднання
psql "$DATABASE_URL"
```

### Помилка: "Table doesn't exist"

**Причина:** Міграції не запустились

**Рішення:**
```bash
npx prisma migrate dev
npx prisma generate
```

### Помилка: "Prisma Client not found"

**Причина:** Client не згенеровано для PostgreSQL

**Рішення:**
```bash
npx prisma generate
```

---

## 📞 Support

Якщо виникли проблеми:
1. Перевірте логи: `tail -100 /tmp/BackendAPIv6.log`
2. Перевірте Prisma: `npx prisma --version`
3. Тест з'єднання: `psql "$DATABASE_URL" -c "SELECT 1"`

---

**Last Updated:** 2026-03-17
**Version:** v6.0.0
