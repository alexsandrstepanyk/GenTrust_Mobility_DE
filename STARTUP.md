# 🚀 GenTrust Mobility - Startup Scripts

## Швидкий старт

### Запуск всього одним командою:
```bash
./dev.sh
```

Це запустить:
- ✅ **Telegram боти** (Master, Scout, City Hall, Quest Provider, Municipal)
- ✅ **Backend API** на http://localhost:3000/api
- ✅ **Frontend** (Expo) на http://localhost:8081
- ✅ **Xcode** з iOS проектом
- ✅ **iOS Simulator** готовий до запуску

### Натисніть `i` в терміналі Expo для запуску на симуляторі

---

## 📋 Доступні скрипти

### `./dev.sh` - Швидкий старт (РЕКОМЕНДУЄТЬСЯ)
Запускає все в фоні та відкриває Xcode.
```bash
./dev.sh
```

### `./start_mobile.sh` - Детальний старт
Більш інформативний вивід з перевіркою залежностей.
```bash
./start_mobile.sh
```

### `./stop.sh` - Зупинка сервісів
Вбиває всі фонові процеси.
```bash
./stop.sh
```

---

## 🎯 Архітектура

```
GenTrust Mobility
├── Telegram боти (5 штук)
│   ├── Master Bot (управління)
│   ├── Scout Bot (основної)
│   ├── City Hall Bot (адміни)
│   ├── Quest Provider Bot
│   └── Municipal Bot
│
├── Backend API (Node.js + Express)
│   ├── PORT: 3000
│   ├── API: /api/auth, /api/reports, /api/quests
│   └── DB: Prisma + SQLite
│
└── Frontend (React Native + Expo)
    ├── PORT: 8081
    ├── iOS Simulator
    └── Android Support
```

---

## 🤖 Telegram боти

### Що роблять боти?

1. **Master Bot** - Управління всім екосистемом (адміни)
2. **Scout Bot** - Основне спілкування з користувачами
3. **City Hall Bot** - Керування городськими даними
4. **Quest Provider Bot** - Розсилання квестів
5. **Municipal Bot** - Комунальні послуги

### Логи ботів
```bash
tail -f .bot.log
```

---

## 📱 Підключення iOS пристрою

1. Підключіть iPhone через USB
2. В Xcode: `Product → Destination → Ваш iPhone`
3. Натисніть Play для запуску на пристрої

---

## 🔧 Розв'язання проблем

### Боти не запускаються
```bash
cd /Users/apple/Desktop/GenTrust_Mobility
npm run build
npm start
```

### Backend не запускається
```bash
cd /Users/apple/Desktop/GenTrust_Mobility
npm run build
npm start  # For bots + API
# або
npm run dev  # For development with nodemon
```

### Frontend не запускається
```bash
cd /Users/apple/Desktop/GenTrust_Mobility/mobile
npx expo start --ios
```

### Очистити кеш
```bash
./stop.sh
pkill -f node
pkill -f expo
rm -rf node_modules/.cache
npm install
./dev.sh
```

### Перевірити логи
```bash
tail -f .bot.log      # Telegram боти
tail -f .backend.log  # Backend API
tail -f .frontend.log # Frontend Expo
```

---

## 🛑 Зупинка

Просто натисніть `Ctrl+C` в терміналі, або запустіть:
```bash
./stop.sh
```

---

## ✅ Перевірка що все працює

### 1. Перевірити API
```bash
curl http://localhost:3000/health
# Має вивести: {"status":"ok","timestamp":"..."}
```

### 2. Перевірити боти
```bash
tail -f .bot.log
# Має бути повідомлення про запуск всіх ботів
```

### 3. Перевірити Expo
```bash
# В терміналі де запущено Expo мають бути:
# "🔧 Loaded modules"
# "Connected to dev server"
```

---

**Enjoy! 🎉**

