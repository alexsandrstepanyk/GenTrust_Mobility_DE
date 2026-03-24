# 🏗️ GENTRUST MOBILITY - ПОВНА АРХІТЕКТУРА СИСТЕМИ

**Версія:** v6.0.2  
**Дата:** 2026-03-19  
**Статус:** Production Ready

---

## 📋 ЗМІСТ

1. [Загальний огляд](#загальний-огляд)
2. [Архітектура сервісів](#архітектура-сервісів)
3. [Порти всіх сервісів](#порти-всіх-сервісів)
4. [Monitor Dashboard (9000)](#monitor-dashboard-9000)
5. [Push Notification Service](#push-notification-service)
6. [Backend API (3000)](#backend-api-3000)
7. [Бази даних](#бази-даних)
8. [Mobile додатки](#mobile-додатки)
9. [Dashboard-и](#dashboard-и)
10. [Департаменти](#департаменти)
11. [Telegram боти](#telegram-боти)
12. [Критичні фічі](#критичні-фічі)
13. [Як запустити все](#як-запустити-все)
14. [Структура файлів](#структура-файлів)

---

## 🎯 ЗАГАЛЬНИЙ ОГЛЯД

**GenTrust Mobility** - це екосистема з **21 сервісу** які працюють разом:

```
┌─────────────────────────────────────────────────────────┐
│              GENTRUST MOBILITY ECOSYSTEM                │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  🌐 Backend API (3000) ← Центральний хаб               │
│       ↓         ↓         ↓                             │
│  📱 Mobile   🏛️ Dashboard   🤖 Bots                    │
│                                                         │
│  Monitor Dashboard (9000) ← Центральний моніторинг     │
│       ↓                                                 │
│  Push Notifications ← Сповіщення на Mac                 │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

## 🏛️ АРХІТЕКТУРА СЕРВІСІВ

### Рівень 1: Core (Обов'язкові)
- ✅ **Backend API** (3000) - обробляє всі запити
- ✅ **Monitor Dashboard** (9000) - моніторинг всіх сервісів
- ✅ **Push Notification Service** - сповіщення на Mac

### Рівень 2: Dashboards
- ✅ **City-Hall Dashboard** (5173) - мерія
- ✅ **Admin Panel** (5174) - адміністрування
- ✅ **Department Base** (5175) - база департаментів

### Рівень 3: 8 Департаментів
- 🛣️ Roads (5180)
- 💡 Lighting (5181)
- 🗑️ Waste (5182)
- 🌳 Parks (5183)
- 🚰 Water (5184)
- 🚌 Transport (5185)
- 🌿 Ecology (5186)
- 🎨 Vandalism (5187)

### Рівень 4: Mobile (Expo)
- 📱 **School App** (8082) - для студентів
- 📱 **Parent App** (8083) - для батьків
- 📱 **Client App** (8081) - для клієнтів

### Рівень 5: Telegram Боти
- 🤖 Master Bot (3001)
- 🔍 Scout Bot (3002)
- 🏛️ City Hall Bot (3003)
- 🎯 Quest Bot (3004)
- 🚧 Municipal Bot (3005)

---

## 🔢 ПОРТИ ВСІХ СЕРВІСІВ

| Сервіс | Порт | Статус | Критичний |
|--------|------|--------|-----------|
| **Backend API** | 3000 | ✅ | 🔴 Так |
| **Monitor Dashboard** | 9000 | ✅ | 🔴 Так |
| **City-Hall** | 5173 | ✅ | 🟡 Ні |
| **Admin Panel** | 5174 | ✅ | 🟡 Ні |
| **Department Base** | 5175 | ✅ | 🟡 Ні |
| **Roads Dept** | 5180 | ✅ | 🟡 Ні |
| **Lighting Dept** | 5181 | ✅ | 🟡 Ні |
| **Waste Dept** | 5182 | ✅ | 🟡 Ні |
| **Parks Dept** | 5183 | ✅ | 🟡 Ні |
| **Water Dept** | 5184 | ✅ | 🟡 Ні |
| **Transport Dept** | 5185 | ✅ | 🟡 Ні |
| **Ecology Dept** | 5186 | ✅ | 🟡 Ні |
| **Vandalism Dept** | 5187 | ✅ | 🟡 Ні |
| **Expo School** | 8082 | ✅ | 🟡 Ні |
| **Expo Parent** | 8083 | ✅ | 🟡 Ні |
| **Expo Client** | 8081 | ✅ | 🟡 Ні |

**Правило:** Всі порти в діапазоні **3000-9000**

---

## 📊 MONITOR DASHBOARD (9000)

### Призначення
**Центральна точка моніторингу всіх сервісів**

### API Endpoints
```bash
GET http://localhost:9000/api/status
# Повертає статус всіх сервісів

GET http://localhost:9000/api/logs/:service
# Повертає логи конкретного сервісу

GET http://localhost:9000/api/all-logs
# Повертає всі логи разом
```

### Формат відповіді /api/status
```json
{
  "services": [
    {
      "id": "backend-api",
      "name": "Backend API",
      "icon": "🌐",
      "port": 3000,
      "status": "online",
      "healthOk": true
    }
  ],
  "database": {
    "status": "online",
    "users": 99
  }
}
```

### Файли
- **server.js** - основний сервер
- **push_notification_service.js** - сервіс сповіщень

---

## 📱 PUSH NOTIFICATION SERVICE

### Призначення
**Перевіряє всі сервіси кожні 30 секунд і показує macOS push-повідомлення**

### Як працює
```javascript
// Кожні 30 секунд
1. GET http://localhost:9000/api/status
2. Перевіряє status кожного сервісу
3. Якщо status != "online" → macOS notification
4. Не спамить (макс 1 на 5 хвилин)
```

### Приклад notification
```applescript
display notification "Порт 3000\nСтатус: error" 
  with title "🚨 Backend API не працює!" 
  sound name "Sosumi"
```

### Запуск
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/monitor
node push_notification_service.js
```

### Логи
```
/tmp/PushNotificationService.log
```

---

## 🌐 BACKEND API (3000)

### Основні Routes

#### Auth
```bash
POST /api/auth/login
POST /api/auth/register
```

#### Quests
```bash
GET  /api/quests/available          # Список доступних квестів
POST /api/quests/:id/take           # Взяти квест
POST /api/quests/:id/complete       # Завершити квест (з фото)
```

#### Reports
```bash
POST /api/reports          # Створити звіт (Urban Guardian)
GET  /api/reports          # Отримати звіти
```

#### Consent (DSGVO)
```bash
GET  /api/consent/templates       # Шаблони згоди
GET  /api/consent/my              # Мої згоди
POST /api/consent/create          # Створити згоду
POST /api/consent/:id/revoke      # Відкликати згоду
```

#### Stats
```bash
GET /api/stats/dashboard    # Статистика для дашбордів
```

### Файли
- **src/api-server.ts** - головний сервер
- **src/api/routes/*.ts** - всі routes
- **src/middleware/** - auth, upload, security

---

## 🗄️ БАЗИ ДАНИХ

### Головна БД
```
prisma/dev.db (SQLite для розробки)
```

### БД Департаментів (8 штук)
```
databases/roads_dept.db
databases/lighting_dept.db
databases/waste_dept.db
databases/parks_dept.db
databases/water_dept.db
databases/transport_dept.db
databases/ecology_dept.db
databases/vandalism_dept.db
```

### Dual-Write Архітектура
Кожен звіт записується в **2 бази**:
1. Головна БД (для City-Hall статистики)
2. БД департаменту (для обробки)

### Основні таблиці
- **User** (99 користувачів)
- **Report** (132 звіти)
- **Quest** (27 квестів)
- **TaskCompletion**
- **DigitalConsent** (DSGVO)
- **ParentChild** (зв'язок батько-дитина)

---

## 📱 MOBILE ДОДАТКИ

### School App (8082)
```
mobile-school/
├── screens/
│   ├── QuestsScreen.tsx
│   ├── QuestDetailsScreen.tsx
│   └── ProfileScreen.tsx
├── config.ts (API URL)
└── package.json
```

**Функції:**
- Перегляд квестів
- Завершення з фото
- Профіль з контактами
- GPS sharing

### Parent App (8083)
```
mobile-parent/
```

**Функції:**
- Перегляд дітей
- Digital Consent (DSGVO)
- Приватні завдання

### Client App (8081)
```
mobile/
```

**Функції:**
- Створення замовлень
- Urban Guardian (AI фото)

---

## 🖥️ DASHBOARD-И

### City-Hall Dashboard (5173)
```
city-hall-dashboard/
```

**Функції:**
- Статистика всіх департаментів
- AI рекомендації (Gemini)
- Модерація звітів

### Admin Panel (5174)
```
admin-panel/
```

**Функції:**
- Управління користувачами
- Схвалення замовлень
- Система налаштувань

---

## 🏢 ДЕПАРТАМЕНТИ

### Структура (однакова для всіх)
```
departments/roads/
├── index.html
├── src/
│   ├── pages/
│   │   ├── Dashboard.tsx
│   │   ├── Reports.tsx
│   │   └── Settings.tsx
│   └── lib/
│       └── api.ts
└── package.json
```

### 8 Департаментів
| Департамент | Порт | Емодзі |
|-------------|------|--------|
| Roads | 5180 | 🛣️ |
| Lighting | 5181 | 💡 |
| Waste | 5182 | 🗑️ |
| Parks | 5183 | 🌳 |
| Water | 5184 | 🚰 |
| Transport | 5185 | 🚌 |
| Ecology | 5186 | 🌿 |
| Vandalism | 5187 | 🎨 |

---

## 🤖 TELEGRAM БОТИ

### Файли
```
src/
├── bot.ts              # Головний бот
├── master_bot.ts       # Master Core Bot
├── city_hall_bot.ts    # City Hall Bot
├── municipal_bot.ts    # Municipal Services Bot
└── quest_provider_bot.ts # Quest Provider Bot
```

### Інтеграція з API
```typescript
// src/api/routes/quests.ts
import { notifyQuestCreated } from '../../services/questNotifications';

notifyQuestCreated(questId);
```

### Функції
- Сповіщення про нові звіти
- Сповіщення про квести
- Модерація через Telegram
- AI аналіз фото (Gemini)

### Запуск
```bash
# Додати в .env
TELEGRAM_BOT_TOKEN=your_token
TELEGRAM_ADMIN_CHAT_ID=your_chat_id

# Запустити backend
npx ts-node src/api-server.ts
```

---

## ⭐ КРИТИЧНІ ФІЧІ

### 1. Quest Completion
```bash
POST /api/quests/:id/complete
```
- ✅ Photo upload
- ✅ GPS location
- ✅ Balance update
- ✅ Dignity points (+5)
- ✅ Auto-approval або verification

### 2. Digital Consent (DSGVO)
```prisma
model DigitalConsent {
  id            String   @id @default(uuid())
  parentId      String
  childId       String
  consentText   String   // Текст згоди
  signatureHash String   // SHA-256
  ipAddress     String
  status        String   // ACTIVE, REVOKED
}
```

### 3. Dual-Write Database
Кожен звіт → 2 бази одночасно

### 4. AI Photo Analysis
```typescript
// Google Gemini 1.5 Flash
const aiVerdict = await gemini.analyze(photo);
// Returns: category, confidence, is_issue
```

---

## 🚀 ЯК ЗАПУСТИТИ ВСЕ

### Автоматичний запуск
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start-v6-full.sh
```

### Ручний запуск (по черзі)

#### 1. Backend API
```bash
npx ts-node src/api-server.ts
```

#### 2. Monitor Dashboard
```bash
cd monitor
node server.js
```

#### 3. Push Notifications
```bash
cd monitor
node push_notification_service.js
```

#### 4. City-Hall Dashboard
```bash
cd city-hall-dashboard
npm run dev
```

#### 5. Admin Panel
```bash
cd admin-panel
npm run dev
```

#### 6. 8 Департаментів
```bash
# Кожен в окремому терміналі
cd departments/roads && npm run dev
cd departments/lighting && npm run dev
# ... і так далі
```

#### 7. Expo School
```bash
cd mobile-school
npx expo start --port 8082 --lan
```

---

## 📁 СТРУКТУРА ФАЙЛІВ

```
GenTrust_Mobility_DE/
├── src/                          # Backend
│   ├── api/
│   │   ├── routes/
│   │   │   ├── quests.ts        # ✅ Quest completion
│   │   │   ├── consent.ts       # ✅ DSGVO
│   │   │   ├── reports.ts       # ✅ Urban Guardian
│   │   │   └── ...
│   │   └── server.ts
│   ├── api-server.ts            # ✅ Головний сервер v6
│   ├── bot.ts                   # 🤖 Telegram
│   └── services/
│
├── monitor/                      # 📊 Monitor Dashboard
│   ├── server.js                # ✅ Основний сервер
│   └── push_notification_service.js  # ✅ macOS notifications
│
├── mobile-school/                # 📱 School App
│   ├── screens/
│   ├── config.ts
│   └── package.json
│
├── city-hall-dashboard/          # 🏛️ City-Hall
├── admin-panel/                  # 🔐 Admin
├── departments/                  # 🏢 8 департаментів
│   ├── roads/
│   ├── lighting/
│   ├── waste/
│   ├── parks/
│   ├── water/
│   ├── transport/
│   ├── ecology/
│   └── vandalism/
│
├── prisma/                       # 🗄️ Бази даних
│   ├── schema.prisma
│   ├── dev.db                   # Головна БД
│   └── migrations/
│
├── databases/                    # 🗄️ БД департаментів
│   ├── roads_dept.db
│   └── ...
│
├── docs/                         # 📚 Документація
│   ├── PUSH_NOTIFICATION_SETUP.md
│   ├── POSTGRESQL_MIGRATION_GUIDE.md
│   └── SYSTEM_ARCHITECTURE.md   # Цей файл
│
├── start-v6-full.sh              # 🚀 Автозапуск всього
├── test_quest_completion.sh      # 🧪 Тест квестів
└── .env                          # 🔐 Конфігурація
```

---

## 📊 СТАН СИСТЕМИ (2026-03-19)

### ✅ Працює
- Backend API (3000)
- Monitor Dashboard (9000)
- Push Notifications
- City-Hall Dashboard (5173)
- Admin Panel (5174)
- Всі 8 департаментів
- Quest Completion
- Digital Consent (DSGVO)

### 📊 Статистика
- **99** користувачів
- **132** звіти
- **27** квестів
- **7** completion photos

### 🧪 Тести
- **Quest Completion Test** - ✅ PASSED
- **API Endpoints** - ✅ WORKING
- **Push Notifications** - ✅ TESTED

---

## 🎯 ШВИДКІ КОМАНДИ

### Перевірити статус всіх сервісів
```bash
curl http://localhost:9000/api/status | python3 -m json.tool
```

### Перевірити логи сервісу
```bash
curl http://localhost:9000/api/logs/backend | python3 -m json.tool
```

### Запустити тест квестів
```bash
./test_quest_completion.sh
```

### Перезапустити все
```bash
killall node vite ts-node expo
./start-v6-full.sh
```

### Подивитися логи push notifications
```bash
tail -f /tmp/PushNotificationService.log
```

---

**Last Updated:** 2026-03-19  
**Version:** v6.0.2  
**Status:** ✅ Production Ready
