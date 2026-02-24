# GenTrust - Complete System Architecture

## 🏗️ System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    GenTrust Platform                             │
└─────────────────────────────────────────────────────────────────┘

┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  📱 Client App   │  │ 📚 School App    │  │ 🌐 Web Staff     │
│  (mobile/)       │  │ (mobile-school/) │  │ (staff-panel/)   │
│                  │  │                  │  │                  │
│ - Orders        │  │ - Dashboard      │  │ - Task Verify    │
│ - Create        │  │ - Tasks          │  │ - Approve/Reject │
│ - Profile       │  │ - Report         │  │ - Statistics     │
└────────┬─────────┘  └────────┬─────────┘  └────────┬─────────┘
         │                      │                     │
         │ HTTP                 │ HTTP                │ HTTP
         └──────────────────────┴─────────────────────┘
                         ▼
            ┌────────────────────────┐
            │   API Server (3000)    │
            │  - Express.js          │
            │  - TypeScript          │
            │  - Error Logging       │
            │  - Admin Routes        │
            └──────────┬─────────────┘
                       │
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
    ┌────────┐    ┌────────┐   ┌──────────┐
    │ Users  │    │ Quests │   │ Reports  │
    └────────┘    └────────┘   └──────────┘
         │             │            │
         └─────────────┴────────────┘
                  ▼
         ┌──────────────────┐
         │  SQLite Database │
         │  (dev.db)        │
         └──────────────────┘

┌────────────────────────────────────────┐
│   Telegram Bots (5 instances)          │
│ - Master Bot (moderation)              │
│ - City Hall Bot                        │
│ - Scout Bot                            │
│ - Municipal Bot                        │
│ - Quest Provider Bot                   │
└────────────────────────────────────────┘

┌────────────────────────────────────────┐
│   Admin Panel (5174)                   │
│ - Dashboard & Statistics               │
│ - Error Monitor & Logs                 │
│ - Activity Tracking                    │
│ - Finance Reports                      │
│ - Pending Tasks Management             │
└────────────────────────────────────────┘
```

---

## 📱 Three-App Architecture

### 1️⃣ **Client App** (`mobile/`)
**Purpose:** Людина, яка замовляє завдання (батьки, вчителі)

**Screens:**
- 🧾 **Orders** - Список створених замовлень (статус, бюджет, дата)
- ➕ **Create** - Форма для нового замовлення (title, description, budget, location, subject, grade)
- 👤 **Profile** - Профіль замовника

**Features:**
-창업 нове замовлення → надходить в Master Bot
- Отримання push при схвалені замовлення
- Перегляд історії замовлень
- Управління профілем

**Tech Stack:**
- React Native + Expo SDK 54
- axios для API
- expo-notifications для push
- SecureStore для зберігання токена

---

### 2️⃣ **School App** (`mobile-school/`)
**Purpose:** Студент, який виконує завдання та допомагає місту

**Screens:**
- 📊 **Dashboard** - Мотиваційний екран з статистикою
  - ✅ Виконано завдань
  - ⏳ Незавершених завдань
  - 💰 Заробленої суми
  - ⭐ Очко добропорядності
- 🎒 **Tasks** - Доступні завдання для виконання
- 📸 **Report** - Форма для звітів про пошкодження міста
- 👤 **Profile** - Профіль студента

**Features:**
- Бачить завдання, які створили клієнти
- Приймає завдання для виконання
- Робить фото доказу при завершенні
- Повідомляє про пошкодження інфраструктури
- Отримує гроші за виконання
- Отримує push при новому завданні
- Бачить свою статистику та рейтинг

**Tech Stack:**
- React Native + Expo SDK 54
- Recharts для графіків (dashboard)
- axios для API
- expo-notifications для push

---

### 3️⃣ **Staff Web Panel** (`staff-panel/`)
**Purpose:** Модератори, які перевіряють виконані завдання (місцева команда)

**Screens:**
- 📋 **Pending Quests** - Список завдань на перевірку
- ✅ **Approve** - Затвердити виконання (студент отримує гроші)
- ❌ **Reject** - Відхилити з причиною
- 📊 **Statistics** - Графіки та метрики

**Features:**
- Переглядати невиконані завдання зі скриншотами
- Затверджувати виконання (платіж студенту)
- Відхиляти завдання з причиною
- Бачити статистику по модератору

**Tech Stack:**
- React + Vite
- axios для API
- CSS Grid для таблиць

---

### 4️⃣ **Admin Dashboard** (`admin-panel/`)
**Purpose:** Ядро системи (начальство, що моніторить всю систему)

**Tabs:**
- 📈 **Dashboard** - Загальна статистика
  - Користувачі (всього, активні, скаути, клієнти)
  - Завдання (всього, виконано, %, заробленоо)
  - Замовлення (всього, схвалено, %)
  - Фінанси (всього виплачено, середнє, сьогодні)
  - Звіти (всього, перевірено, %)

- 🐛 **Errors** - Моніторинг помилок
  - Список всіх помилок з модулями
  - Позначення як вирішена
  - Статистика помилок

- 📊 **Activity** - Активність користувачів
  - Активні за останню годину
  - Нові користувачі сьогодні
  - Розподіл по ролям
  - Графік завдань (30 днів)

- ⚠️ **Pending** - Завдання на модерацію
  - Замовлення, що чекають схвалення
  - Проблемні звіти

- 💰 **Finance** - Фінансовий звіт
  - Загальна виплачена сума
  - Очікування платежу
  - Топ-10 завдань

**Tech Stack:**
- React + Vite
- Recharts для графіків
- axios для API

---

## 🔄 Complete Flow

```
STAGE 1: CLIENT CREATES ORDER
┌─────────────────────────────────────┐
│ Client opens mobile app              │
│ Navigates to "Create" tab            │
│ Fills form:                          │
│  - Title: "Help with math"          │
│  - Budget: ₴500                     │
│  - Location: "School #5"            │
│ Clicks Submit                        │
└────────────────┬────────────────────┘
                 ▼
        TaskOrder created in DB
        Status: PENDING_MODERATION
                 ▼
        Master Bot receives
        Shows in Telegram with
        ✅ Approve / ❌ Reject buttons

STAGE 2: MASTER BOT MODERATES
┌─────────────────────────────────────┐
│ Master Bot operator reviews order    │
│ Checks if legitimate                 │
│ Clicks ✅ Approve                   │
└────────────────┬────────────────────┘
                 ▼
        Status: APPROVED
        ↓
        Auto-create Quest with
        details from TaskOrder
        ↓
        Status: PUBLISHED
                 ▼
        Push notification to
        all Scout users

STAGE 3: STUDENT FINDS TASK
┌─────────────────────────────────────┐
│ School app shows new task in Tasks   │
│ Student reads title & budget        │
│ Receives push: "New quest ₴500"    │
│ Clicks to accept                    │
│ Task status: ACTIVE for this student │
└────────────────┬────────────────────┘
                 ▼
        Student goes to location
        Completes the task
        Takes photo
        Submits report

STAGE 4: STAFF VERIFIES
┌─────────────────────────────────────┐
│ Staff Panel shows pending quest      │
│ Moderator reviews photo + details    │
│ Clicks ✅ Approve                   │
└────────────────┬────────────────────┘
                 ▼
        Quest status: COMPLETED
        Push to student: "Task verified!"
        ↓
        Balance updated: +₴500
        ↓
        Push to client:
        "Your task completed!"

STAGE 5: ANALYTICS
┌─────────────────────────────────────┐
│ Admin Dashboard shows:               │
│ - New completed quest (+1)           │
│ - New earnings (+₴500)               │
│ - Student integrity updated          │
│ - All tracked in database            │
└─────────────────────────────────────┘
```

---

## 🛠️ API Endpoints Overview

### **Auth Routes** (`/api/auth/`)
- `POST /login` - Логін користувача
- `POST /register` - Реєстрація
- `POST /refresh-token` - Оновлення токена

### **Users Routes** (`/api/users/`)
- `GET /stats` - Статистика користувача
- `POST /push-token` - Реєстрація push токена
- `GET /profile` - Профіль користувача

### **Quests Routes** (`/api/quests/`)
- `GET /available` - Доступні завдання
- `POST /:id/accept` - Прийняти завдання
- `POST /:id/submit` - Подати завдання на перевірку
- `GET /my` - Мої завдання

### **Task Orders Routes** (`/api/task-orders/`)
- `POST /` - Створити замовлення
- `GET /my` - Мої замовлення
- `GET /:id` - Деталі замовлення

### **Reports Routes** (`/api/reports/`)
- `POST /` - Новий звіт про пошкодження
- `GET /` - Список звітів
- `POST /:id/verify` - Перевірити звіт

### **Admin Routes** (`/api/admin/`)
- `GET /stats` - Загальна статистика
- `GET /errors` - Список помилок
- `GET /errors/stats` - Статистика помилок
- `POST /errors/:id/resolve` - Позначити як вирішену
- `GET /users/activity` - Активність користувачів
- `GET /quests/top` - Топ завдання
- `GET /task-orders/pending` - Замовлення на модерацію
- `GET /reports/problematic` - Проблемні звіти
- `GET /activity/timeline` - Графік активності
- `GET /finance/report` - Фінансовий звіт

---

## 🔐 Authentication

### JWT Token Flow
```
1. POST /api/auth/login
   ↓
   Server creates JWT token
   Expires in 7 days
   ↓
2. Client stores in SecureStore
   ↓
3. Every request includes:
   Authorization: Bearer <token>
   ↓
4. Server validates token
   ↓
5. If expired: POST /api/auth/refresh-token
```

### Admin Access
```
Headers: {
  Authorization: "Bearer <ADMIN_TOKEN>"
}
```

---

## 📊 Database Schema (Prisma)

**Key Models:**
- **User** - Учасники (email, role, balance, integrity)
- **Quest** - Завдання (title, reward, status, assignee)
- **TaskOrder** - Замовлення від клієнтів
- **Report** - Звіти про пошкодження міста
- **Provider** - Постачальники завдань (бізнес, школи)
- **MunicipalTask** - Завдання для міста (від звітів)

---

## 🚀 Deployment Checklist

### Backend
- [ ] Set `ADMIN_TOKEN` in `.env`
- [ ] Configure `DATABASE_URL` (PostgreSQL for production)
- [ ] Set JWT secret
- [ ] Enable HTTPS
- [ ] Configure CORS properly
- [ ] Deploy on Heroku/AWS/DigitalOcean
- [ ] Setup error monitoring (Sentry)

### Mobile Apps
- [ ] Build APK/IPA with EAS
- [ ] Submit to App Store/Play Store
- [ ] Configure API URL to production
- [ ] Enable push notifications (setup Expo creds)

### Admin Panel
- [ ] Build with `npm run build`
- [ ] Deploy to Vercel/Netlify
- [ ] Setup custom domain
- [ ] Configure admin token securely

---

## 🔧 Development Commands

```bash
# Build backend
npm run build

# Start backend (port 3000)
npm start

# Client app (port 8081)
cd mobile && npx expo start --ios

# School app (port 8081)
cd mobile-school && npx expo start --ios

# Staff panel (port 5173)
cd staff-panel && npm run dev

# Admin panel (port 5174)
cd admin-panel && npm run dev

# View error logs
tail -f logs/errors-$(date +%Y-%m-%d).json
```

---

## 📈 Monitoring & Logging

### Error Logger
- Automatically catches all errors
- Saves to `logs/errors-{date}.json`
- Accessible via Admin Dashboard
- Can mark as resolved

### Push Notifications
- Automatic on:
  - Order approved ✅
  - New quest available 🎯
  - Task verified ✅
  - Integrity score change ⭐

### Analytics
- Real-time dashboards
- User activity tracking
- Financial reports
- Quest completion rates

---

## 🎯 Key Features

✅ **Two-App Architecture** - Separate apps for clients and students
✅ **Master Bot Moderation** - Telegram-based approval process
✅ **Push Notifications** - Real-time updates for all users
✅ **Error Logging** - Comprehensive error tracking
✅ **Admin Dashboard** - Complete system monitoring
✅ **Financial Tracking** - Full accounting of earnings
✅ **Activity Timeline** - 30-day activity graphs
✅ **Role-Based Access** - Different permissions per role
✅ **Offline Support** - Works without internet (partial)

---

## 🌐 System Stats (Example)

```
Users: 500+
├─ Active: 234
├─ Scouts: 380
└─ Clients: 120

Quests: 1,250+
├─ Completed: 890
└─ Completion Rate: 71%

Finances: ₴45,000+
├─ Total Paid: ₴45,000
├─ Today: ₴1,200
└─ Avg per Quest: ₴50

Reports: 350+
├─ Verified: 280
└─ Verification Rate: 80%
```

---

## 📞 Support

### For Issues:
1. Check Admin Dashboard → Errors tab
2. View logs: `logs/errors-{date}.json`
3. Review database for inconsistencies
4. Check API health: `GET /api/health`

### Common Issues:
- **Push not working:** Check token registration
- **Login fails:** Verify JWT secret
- **Database error:** Check Prisma migrations
- **Admin access denied:** Verify ADMIN_TOKEN

---

**Created with ❤️ for Ukrainian education**
