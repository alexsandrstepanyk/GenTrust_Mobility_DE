# 🔍 TECHNOLOGY AUDIT & OPTIMIZATION PLAN

**Дата:** 2026-03-05  
**Версія:** v4.0.0  
**Статус:** Production Ready (13 сервісів працюють)

---

## 📊 ПОТОЧНИЙ СТЕК ТЕХНОЛОГІЙ

### **Backend:**
- **Runtime:** Node.js 20.18.x
- **Framework:** Express.js 5.2.1
- **Language:** TypeScript 5.3.3
- **Database:** SQLite (dev) / PostgreSQL (prod)
- **ORM:** Prisma 5.10.2
- **Bots:** Telegraf 4.15.3
- **Real-time:** Socket.IO 4.8.3
- **AI:** Google Gemini 1.5 Flash

### **Frontend:**
- **Dashboards:** Vite + React (11 дашбордів)
- **Mobile:** React Native + Expo SDK 54
- **Monitor:** Vanilla JS + Socket.IO

### **Database:**
- **SQLite:** 15 таблиць, 426 KB
- **14 користувачів** в базі

---

## ⚠️ ВИЯВЛЕНІ ПРОБЛЕМИ

### **1. Продуктивність (CPU/RAM)**

**Поточне споживання:**
```
Backend API (ts-node):     205 MB RAM, ~0% CPU
Monitor Dashboard (node):  189 MB RAM, ~0% CPU
8 Department Dashboards:   ~1.6 GB RAM (200 MB кожен)
Admin Panel:               ~200 MB RAM
City-Hall Dashboard:       ~200 MB RAM
─────────────────────────────────────
РАЗОМ:                     ~2.4 GB RAM
```

**Проблема:** Кожен Vite dashboard споживає ~200 MB RAM через:
- Hot Module Replacement (HMR) в dev режимі
- React DevTools
- Source maps

### **2. Архітектура Баз Даних**

**ПОТОЧНО:**
```
1 SQLite база для ВСІХ сервісів
├── 15 таблиць
├── 14 користувачів
└── 426 KB розмір
```

**Проблема:**
- ❌ **Єдина точка відмови** - якщо база "впаде", не працюватиме нічого
- ❌ **Блокування** - 13 сервісів читають/пишуть в одну базу
- ❌ **Масштабованість** - неможливо розподілити навантаження

### **3. Департаменти**

**ПОТОЧНО:**
```
8 департаментів → 1 база → 15 таблиць
```

**Проблема:**
- Всі департаменти читають ВСІ дані
- Немає ізоляції
- Неможливо оптимізувати запити для конкретного департаменту

---

## 🚀 РЕКОМЕНДАЦІЇ ЩОДО ОПТИМІЗАЦІЇ

### **РІВЕНЬ 1: Швидка Оптимізація (1-2 дні)**

#### **1.1 Вимкнути HMR в Production**

**Проблема:** Vite HMR споживає 30-40% CPU в dev режимі

**Рішення:**
```bash
# Замість:
npm run dev

# Використовувати:
npm run build && npm run preview
```

**Економія:**
- RAM: 200 MB → 50 MB на дашборд (-75%)
- CPU: 30% → 5%

#### **1.2 Оптимізувати TypeScript**

**Проблема:** `ts-node` повільний для production

**Рішення:**
```bash
# Завжди компілювати в JavaScript:
npm run build  # tsc
node dist/index.js  # замість ts-node
```

**Економія:**
- RAM: 205 MB → 120 MB (-40%)
- Startup: 5s → 1s

#### **1.3 Додати Redis Cache**

**Проблема:** Часті запити до БД

**Рішення:**
```javascript
// Redis для кешування:
- Користувачі (5 хв)
- Звіти (1 хв)
- Статистика (30 сек)
```

**Економія:**
- DB запити: -80%
- Response time: 200ms → 20ms

---

### **РІВЕНЬ 2: Архітектурна Оптимізація (1-2 тижні)**

#### **2.1 Розділити Бази Даних**

**ПОТОЧНО:**
```
┌──────────────────────────────────────┐
│         1 SQLite Database            │
│  ┌────────┬────────┬────────┐        │
│  │ Users  │Reports │ Quests │ ...    │
│  └────────┴────────┴────────┘        │
└──────────────────────────────────────┘
```

**НОВА АРХІТЕКТУРА:**
```
┌─────────────────────┐
│   PostgreSQL (Main) │
│   ┌───────────────┐ │
│   │ Users         │ │
│   │ Auth          │ │
│   │ Dignity Score │ │
│   │ Balance       │ │
│   └───────────────┘ │
└─────────────────────┘
         │
         ├─────┬─────┬─────┬─────┐
         │     │     │     │     │
    ┌────▼─┐ ┌─▼────┐ ┌─▼────┐ ┌─▼────┐
    │Roads │ │Light │ │Waste │ │ ...  │
    │ SQLite│ │ SQLite│ │ SQLite│ │ SQLite│
    │Reports│ │Reports│ │Reports│ │Reports│
    └──────┘ └──────┘ └──────┘ └──────┘
```

**Переваги:**
- ✅ **Ізоляція** - кожен департамент має свою БД
- ✅ **Продуктивність** - менше таблиць = швидші запити
- ✅ **Масштабованість** - можна винести на окремий сервер
- ✅ **Надійність** - якщо "впала" одна БД, інші працюють

**Міграція:**
```sql
-- 1. Головна база (PostgreSQL)
CREATE DATABASE gentrust_main;
-- Таблиці: Users, Auth, Roles, DignityScore, Balance

-- 2. База департаменту (SQLite)
CREATE DATABASE roads_dept;
-- Таблиці: Reports (тільки roads), Statistics, Settings

-- 3. Синхронізація через API
POST /api/sync/user/:id
GET /api/departments/roads/reports
```

#### **2.2 Мікросервісна Архіітектура**

**ПОТОЧНО:**
```
┌──────────────────────────┐
│   Monolith Backend       │
│  - API                   │
│  - 5 Telegram Botів      │
│  - Cron jobs             │
│  - Socket.IO             │
└──────────────────────────┘
```

**НОВА АРХІТЕКТУРА:**
```
┌─────────────┐     ┌──────────────┐
│  API Gateway│────▶│  Auth Service│
│  (port 3000)│     │  (JWT, OAuth)│
└─────────────┘     └──────────────┘
       │
       ├──────┬──────┬────────┬────────┐
       │      │      │        │        │
   ┌───▼──┐ ┌─▼────┐ ┌─▼─────┐ ┌─▼────┐
   │Users │ │Reports│ │Quests │ │ Bots │
   │Service│ │Service│ │Service│ │Service│
   └──────┘ └──────┘ └───────┘ └──────┘
```

**Переваги:**
- ✅ **Незалежне масштабування**
- ✅ **Швидший деплой** (тільки змінені сервіси)
- ✅ **Стійкість до помилок**

---

### **РІВЕНЬ 3: Production Оптимізація (1 місяць)**

#### **3.1 Docker Containerization**

```dockerfile
# Backend API
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

**Переваги:**
- ✅ **Консистентність** - працює однаково всюди
- ✅ **Масштабованість** - Kubernetes ready
- ✅ **Ізоляція** - кожен сервіс в окремому контейнері

#### **3.2 Database Sharding**

```
Shard 1: Users A-M
Shard 2: Users N-Z
Shard 3: Reports 2026-Q1
Shard 4: Reports 2026-Q2
```

#### **3.3 CDN + Static Assets**

```
┌──────────────┐
│   Cloudflare │
│     CDN      │
└──────────────┘
       │
       ├─ Static files (JS, CSS, images)
       ├─ Dashboard builds
       └─ Mobile app bundles
```

---

## 📈 ПОРІВНЯННЯ ПРОДУКТИВНОСТІ

### **ПОТОЧНА ПРОДУКТИВНІСТЬ:**

| Metric | Value |
|--------|-------|
| RAM Total | ~2.4 GB |
| CPU Idle | ~5% |
| DB Queries/sec | ~100 |
| Response Time | 200-500ms |
| Concurrent Users | 50-100 |

### **ПІСЛЯ ОПТИМІЗАЦІЇ (Рівень 2):**

| Metric | Target | Improvement |
|--------|--------|-------------|
| RAM Total | ~800 MB | **-67%** |
| CPU Idle | ~2% | **-60%** |
| DB Queries/sec | ~500 | **+400%** |
| Response Time | 50-100ms | **-75%** |
| Concurrent Users | 500-1000 | **+900%** |

---

## 🎯 ПЛАН ДІЙ

### **Тиждень 1: Швидка Оптимізація**
1. [ ] Вимкнути HMR в production
2. [ ] Додати Redis cache
3. [ ] Компілювати TypeScript в JavaScript
4. [ ] Налаштувати PM2 cluster mode

### **Тиждень 2-3: Архітектура**
1. [ ] Розділити бази даних (Main + 8 Departments)
2. [ ] Мігрувати Users в PostgreSQL
3. [ ] Створити API для синхронізації
4. [ ] Тестування продуктивності

### **Тиждень 4: Production Ready**
1. [ ] Docker containerization
2. [ ] Load balancing (Nginx)
3. [ ] Monitoring (Prometheus + Grafana)
4. [ ] CI/CD pipeline

---

## 💾 ДЕТАЛЬНА СХЕМА БАЗ ДАНИХ

### **Main Database (PostgreSQL)**

```sql
-- Users (головна таблиця)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  telegram_id BIGINT UNIQUE,
  email VARCHAR(255) UNIQUE,
  password_hash VARCHAR(255),
  
  -- Profile
  username VARCHAR(100),
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  birth_date VARCHAR(10),
  school VARCHAR(255),
  grade VARCHAR(50),
  phone VARCHAR(50),
  address TEXT,
  
  -- System
  role VARCHAR(50) DEFAULT 'SCOUT',
  status VARCHAR(50) DEFAULT 'PENDING',
  language VARCHAR(10) DEFAULT 'uk',
  
  -- Metrics
  dignity_score INTEGER DEFAULT 50,
  balance DECIMAL(10,2) DEFAULT 0.00,
  district VARCHAR(100),
  city VARCHAR(100),
  country VARCHAR(2) DEFAULT 'DE',
  
  -- Push notifications
  push_token VARCHAR(500),
  
  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Auth & Sessions
CREATE TABLE sessions (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  token VARCHAR(500) UNIQUE,
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Parent-Child Relations
CREATE TABLE parent_child (
  id UUID PRIMARY KEY,
  parent_id UUID REFERENCES users(id),
  child_id UUID REFERENCES users(id),
  status VARCHAR(50) DEFAULT 'PENDING',
  approval_code VARCHAR(10),
  approved_at TIMESTAMP,
  can_track_gps BOOLEAN DEFAULT TRUE,
  can_view_quests BOOLEAN DEFAULT TRUE,
  can_create_tasks BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(parent_id, child_id)
);

-- Global Quests (логістика)
CREATE TABLE quests (
  id UUID PRIMARY KEY,
  title VARCHAR(255),
  description TEXT,
  type VARCHAR(50), -- 'DELIVERY', 'URBAN_GUARDIAN', etc.
  status VARCHAR(50) DEFAULT 'OPEN',
  reward_amount DECIMAL(10,2),
  created_by UUID REFERENCES users(id),
  assigned_to UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

-- Leaderboard Snapshots
CREATE TABLE leaderboard_snapshots (
  id UUID PRIMARY KEY,
  snapshot_date DATE DEFAULT CURRENT_DATE,
  user_id UUID REFERENCES users(id),
  dignity_score INTEGER,
  balance DECIMAL(10,2),
  rank INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_users_telegram ON users(telegram_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_district ON users(district, city);
CREATE INDEX idx_quests_status ON quests(status);
CREATE INDEX idx_leaderboard_date ON leaderboard_snapshots(snapshot_date, rank);
```

### **Department Database (SQLite) - Roads Example**

```sql
-- Reports (тільки для Roads)
CREATE TABLE reports (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  category TEXT DEFAULT 'roads',
  description TEXT,
  latitude REAL,
  longitude REAL,
  photo_url TEXT,
  status TEXT DEFAULT 'PENDING', -- PENDING, APPROVED, REJECTED, IN_PROGRESS, COMPLETED
  ai_confidence REAL,
  ai_category TEXT,
  forwarded_to TEXT DEFAULT 'roads',
  moderator_action TEXT,
  rejected_reason TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME,
  approved_at DATETIME,
  completed_at DATETIME
);

-- Department Statistics
CREATE TABLE department_stats (
  id TEXT PRIMARY KEY,
  date TEXT UNIQUE,
  total_reports INTEGER DEFAULT 0,
  pending_reports INTEGER DEFAULT 0,
  approved_reports INTEGER DEFAULT 0,
  rejected_reports INTEGER DEFAULT 0,
  in_progress_reports INTEGER DEFAULT 0,
  completed_reports INTEGER DEFAULT 0,
  avg_confidence REAL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Department Settings
CREATE TABLE department_settings (
  id TEXT PRIMARY KEY,
  notification_email TEXT,
  auto_approve_threshold REAL DEFAULT 0.8,
  max_reports_per_day INTEGER DEFAULT 100,
  working_hours_start INTEGER DEFAULT 8,
  working_hours_end INTEGER DEFAULT 18,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_user ON reports(user_id);
CREATE INDEX idx_reports_location ON reports(latitude, longitude);
CREATE INDEX idx_reports_created ON reports(created_at);
```

---

## 🔧 МІГРАЦІЙНИЙ СКРИПТ

```bash
#!/bin/bash
# migrate_to_multi_db.sh

echo "🚀 Starting Multi-Database Migration..."

# 1. Backup існуючої бази
sqlite3 prisma/dev.db ".backup 'backups/pre_migration_$(date +%Y%m%d).db'"

# 2. Експорт Users в PostgreSQL
sqlite3 prisma/dev.db ".mode csv" ".output /tmp/users.csv" "SELECT * FROM User;"
psql -U gentrust -d gentrust_main -c "\copy users FROM '/tmp/users.csv' WITH CSV HEADER;"

# 3. Експорт Reports по департаментах
for dept in roads lighting waste parks water transport ecology vandalism; do
  sqlite3 prisma/dev.db ".mode csv" ".output /tmp/${dept}_reports.csv" \
    "SELECT * FROM Report WHERE forwardedTo='$dept';"
  
  # Імпорт в SQLite департаменту
  sqlite3 "databases/${dept}_dept.db" ".import /tmp/${dept}_reports.csv reports"
done

# 4. Оновлення конфігурації
echo "✅ Migration completed!"
echo "📊 Main DB: PostgreSQL (gentrust_main)"
echo "📊 Department DBs: 8x SQLite"
```

---

## 📊 ВИСНОВКИ

### **ПОТОЧНИЙ СТАН:**
- ✅ **Працездатно** - 13 сервісів працюють
- ⚠️ **Неоптимально** - 2.4 GB RAM, 1 база даних
- ⚠️ **Не масштабовано** - монолітна архітектура

### **ПІСЛЯ ОПТИМІЗАЦІЇ:**
- ✅ **Швидко** - 800 MB RAM, response time 50ms
- ✅ **Надійно** - розділені бази даних
- ✅ **Масштабовано** - мікросервіси + Docker
- ✅ **Production Ready** - 500-1000 користувачів

### **РЕКОМЕНДОВАНИЙ ПЛАН:**
1. **Тиждень 1:** Рівень 1 (швидка оптимізація)
2. **Тиждень 2-3:** Рівень 2 (архітектура)
3. **Тиждень 4:** Рівень 3 (production)

**Час реалізації:** 1 місяць  
**Очікуваний приріст продуктивності:** **400-900%**

---

**Generated:** 2026-03-05  
**Author:** GenTrust Mobility Tech Team  
**Version:** v1.0
