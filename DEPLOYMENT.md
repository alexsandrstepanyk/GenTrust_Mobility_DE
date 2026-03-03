# 🚀 GENTRUST MOBILITY - DEPLOYMENT GUIDE

## 📋 РОЗГОРТАННЯ ПРОЕКТУ НА ІНШОМУ ПК

### ⚠️ ВАЖЛИВО: Ці файли НЕ завантажуються на GitHub

Наступні файли виключені з git (`.gitignore`):
- `node_modules/` - залежності npm (встановлюються через `npm install`)
- `.env` - секрети та токени (потрібно створити вручну)
- `*.db` - база даних (створюється автоматично)
- `*.log` - логи (створюються під час роботи)
- `.expo/` - кеш Expo (створюється автоматично)

---

## 🔧 КРОК 1: КЛОНУВАННЯ РЕПОЗИТОРІЮ

```bash
# Клонуйте репозиторій
git clone https://github.com/alexsandrstepanyk/GenTrust_Mobility_DE.git

# Перейдіть в директорію
cd GenTrust_Mobility_DE
```

---

## 🔧 КРОК 2: ВСТАНОВЛЕННЯ ЗАЛЕЖНОСТЕЙ

### Backend (головний проект):

```bash
# Встановити залежності
npm install

# Встановити Prisma
npx prisma install

# Створити базу даних
npx prisma migrate dev --name init
```

### Admin Panel:

```bash
cd admin-panel
npm install
cd ..
```

### City-Hall Dashboard:

```bash
cd city-hall-dashboard
npm install
cd ..
```

### Staff Panel:

```bash
cd staff-panel
npm install
cd ..
```

### Department Dashboards (всі 8):

```bash
# Roads
cd departments/roads
npm install
cd ../..

# Lighting
cd departments/lighting
npm install
cd ../..

# Waste
cd departments/waste
npm install
cd ../..

# Parks
cd departments/parks
npm install
cd ../..

# Water
cd departments/water
npm install
cd ../..

# Transport
cd departments/transport
npm install
cd ../..

# Ecology
cd departments/ecology
npm install
cd ../..

# Vandalism
cd departments/vandalism
npm install
cd ../..
```

### Mobile School:

```bash
cd mobile-school
npm install
cd ..
```

### Mobile Parent:

```bash
cd mobile-parent
npm install
cd ..
```

### Monitor Dashboard:

```bash
cd monitor
npm install
cd ..
```

---

## 🔧 КРОК 3: СТВОРЕННЯ .ENV ФАЙЛУ

Створіть файл `.env` в корені проекту:

```bash
# Database
DATABASE_URL="file:./prisma/dev.db"

# JWT Secret
JWT_SECRET="your-secret-key-change-this"

# Server Port
PORT=3000

# Telegram Bot Tokens (отримати від @BotFather)
TELEGRAM_BOT_TOKEN="your-bot-token"
TELEGRAM_CITY_HALL_BOT_TOKEN="your-city-hall-bot-token"
TELEGRAM_QUEST_PROVIDER_BOT_TOKEN="your-quest-bot-token"
TELEGRAM_MUNICIPAL_BOT_TOKEN="your-municipal-bot-token"

# Gemini API Key (для AI аналізу звітів)
GEMINI_API_KEY="your-gemini-api-key"

# Expo Push Notifications
EXPO_PUSH_API="https://exp.host/--/api/v2/push/send"

# Admin User
ADMIN_USER_ID="admin-uuid-here"
SAFETY_GUARD=true
SAFETY_START_HOUR=22
SAFETY_END_HOUR=7
```

---

## 🔧 КРОК 4: СТВОРЕННЯ БАЗИ ДАНИХ

```bash
# Створити базу даних
npx prisma migrate dev --name init

# Сгенерувати Prisma Client
npx prisma generate

# (Опціонально) Відкрити Studio
npx prisma studio
```

---

## 🔧 КРОК 5: ЗАПУСК ВСІХ СЕРВІСІВ

### Варіант 1: Через start.sh (рекомендовано)

```bash
# Зробити скрипт виконуваним
chmod +x start.sh

# Запустити всі сервіси
bash start.sh
```

### Варіант 2: Через Monitor Dashboard (9000)

```bash
# Запустити Monitor
cd monitor
node server.js

# Відкрити в браузері
open http://localhost:9000

# Натиснути кнопки:
# 🤖 Запустити ВСІ Telegram боти
# 🖥️ Запустити ВСІ Dashboards
# 📱 Запустити ВСІ Expo Apps
```

### Варіант 3: Окремо кожен сервіс

```bash
# Backend API (в корені)
npm run dev

# Admin Panel (в окремому терміналі)
cd admin-panel && npm run dev

# City-Hall Dashboard (в окремому терміналі)
cd city-hall-dashboard && npm run dev

# Staff Panel (в окремому терміналі)
cd staff-panel && npm run dev

# Departments (в окремих терміналах)
cd departments/roads && npm run dev
cd departments/lighting && npm run dev
# ... і так далі для всіх 8

# Mobile School (в окремому терміналі)
cd mobile-school && npx expo start --port 8082 --lan

# Mobile Parent (в окремому терміналі)
cd mobile-parent && npx expo start --port 8083 --lan
```

---

## 🔧 КРОК 6: ПЕРЕВІРКА РОБОТИ

### Перевірити Backend API:

```bash
curl http://localhost:3000/api/health
```

**Очікувана відповідь:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-03T..."
}
```

### Перевірити порти:

```bash
lsof -i :3000,5173,5174,5176,5180,5181,5182,5183,5184,5185,5186,5187,8082,9000
```

### Відкрити всі дашборди:

```bash
# Monitor Dashboard
open http://localhost:9000

# City-Hall Dashboard
open http://localhost:5173

# Admin Panel
open http://localhost:5174

# Staff Panel
open http://localhost:5176

# Departments
open http://localhost:5180  # Roads
open http://localhost:5181  # Lighting
open http://localhost:5182  # Waste
open http://localhost:5183  # Parks
open http://localhost:5184  # Water
open http://localhost:5185  # Transport
open http://localhost:5186  # Ecology
open http://localhost:5187  # Vandalism
```

---

## 🔧 КРОК 7: НАЛАШТУВАННЯ АВТОЗАПУСКУ (macOS)

```bash
# Скопіювати LaunchAgent
cp com.gentrust.autostart.plist ~/Library/LaunchAgents/

# Завантажити агент
launchctl load ~/Library/LaunchAgents/com.gentrust.autostart.plist

# Перевірити статус
launchctl list | grep gentrust
```

---

## 📊 ВСІ ПОРТИ (21 сервіс)

| Категорія | Сервіс | Порт |
|-----------|--------|------|
| **Monitor** | Monitor Dashboard | **9000** |
| **Backend** | Backend API + Botи | **3000** |
| **Core** | City-Hall Dashboard | **5173** |
| **Core** | Admin Panel | **5174** |
| **Core** | Staff Panel | **5176** |
| **Dept** | Roads | **5180** |
| **Dept** | Lighting | **5181** |
| **Dept** | Waste | **5182** |
| **Dept** | Parks | **5183** |
| **Dept** | Water | **5184** |
| **Dept** | Transport | **5185** |
| **Dept** | Ecology | **5186** |
| **Dept** | Vandalism | **5187** |
| **Mobile** | Mobile School | **8082** |
| **Mobile** | Mobile Parent | **8083** |
| **Mobile** | Mobile Client | **8081** |

---

## 🛠️ ВИРІШЕННЯ ПРОБЛЕМ

### Помилка: "Port already in use"

```bash
# Звільнити всі порти
killall -9 node npm vite expo 2>/dev/null || true

# Або конкретний порт
lsof -ti:3000 | xargs kill -9
```

### Помилка: "Module not found"

```bash
# Очистити кеш npm
npm cache clean --force

# Видалити node_modules
rm -rf node_modules

# Встановити заново
npm install
```

### Помилка: "Database not found"

```bash
# Створити базу даних
npx prisma migrate dev --name init
```

### Помилка: "Telegram bot token invalid"

1. Відкрийте @BotFather в Telegram
2. Створіть нового бота або отримайте токен існуючого
3. Оновіть `.env` файл

---

## 📁 СТРУКТУРА ПРОЕКТУ

```
GenTrust_Mobility_DE/
├── src/                          # Backend API + Telegram Botи
│   ├── api/                      # REST API endpoints
│   ├── bot.ts                    # Scout Bot
│   ├── master_bot.ts             # Master Core Bot
│   ├── city_hall_bot.ts          # City Hall Bot
│   └── ...
├── admin-panel/                  # Admin Panel (5174)
├── city-hall-dashboard/          # City-Hall Dashboard (5173)
├── staff-panel/                  # Staff Panel (5176)
├── departments/                  # 8 Department Dashboards (5180-5187)
│   ├── roads/
│   ├── lighting/
│   ├── waste/
│   ├── parks/
│   ├── water/
│   ├── transport/
│   ├── ecology/
│   └── vandalism/
├── mobile-school/                # Mobile School App (8082)
├── mobile-parent/                # Mobile Parent App (8083)
├── monitor/                      # Monitor Dashboard (9000)
├── prisma/                       # Database schema
├── .env                          # Environment variables (створити!)
├── .gitignore                    # Git ignore rules
├── package.json                  # Main dependencies
├── start.sh                      # Startup script
├── com.gentrust.autostart.plist  # macOS LaunchAgent
└── README.md                     # Documentation
```

---

## ✅ CHECKLIST ПІСЛЯ РОЗГОРТАННЯ

- [ ] Встановлені всі залежності (`npm install` в кожній папці)
- [ ] Створено `.env` файл з токенами
- [ ] Створено базу даних (`npx prisma migrate dev`)
- [ ] Backend API відповідає (`curl http://localhost:3000/api/health`)
- [ ] Monitor Dashboard відкривається (http://localhost:9000)
- [ ] Всі департаменти запущені (5180-5187)
- [ ] Mobile Apps запускаються через Expo

---

**Останнє оновлення:** 2026-03-03  
**Версія:** 2.0  
**Статус:** ✅ ГОТОВО ДО РОЗГОРТАННЯ
