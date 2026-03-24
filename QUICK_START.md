# ⚡ GENTRUST - ШВИДКА ДОВІДКА

**Версія:** v6.0.2 | **Дата:** 2026-03-23 | **Статус:** ✅ Production Ready

---

## 🚀 ЗАПУСК (3 команди)

```bash
# 1. Запустити ВСІ сервіси (Backend + Dashboards + Departments)
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start.sh

# 2. Запустити Expo Parent (окремо)
./start_parent.sh

# 3. Перевірити що все працює
./test_system_full.sh
```

**Час запуску:** ~60 сек | **Сервісів онлайн:** 12/20

---

## 🛑 ЗУПИНКА (2 команди)

```bash
# 1. Зупинити Expo Parent
./stop_parent.sh

# 2. Зупинити все
./stop_all.sh
```

---

## 📊 МОНІТОРИНГ

### Monitor Dashboard (Центральна точка):
```
http://localhost:9000
```

**Що показує:**
- ✅ Статус всіх сервісів (реальний час)
- 📋 Логи кожного сервісу
- 🎮 Кнопки Старт/Стоп/Рестарт
- 📊 Database status (100 користувачів)

### API Endpoints:
```bash
# Статус всіх сервісів
curl http://localhost:9000/api/status | python3 -m json.tool

# Логи конкретного сервісу
curl http://localhost:9000/api/logs/backend-api

# Health check Backend
curl http://localhost:3000/api/health
```

---

## 📱 EXPO PARENT (Батьки)

### Запуск:
```bash
./start_parent.sh
```

### Підключення на телефоні:
1. Відкрийте **Expo Go**
2. Введіть: `exp://192.168.178.34:8083`
3. Натисніть "Load"

### Тестові дані:
```
Email: admin@parent.com
Password: admin
```

---

## 🏛️ ВСІ URL

| Сервіс | URL | Статус |
|--------|-----|--------|
| 🎯 Monitor | http://localhost:9000 | ✅ |
| 🌐 Backend API | http://localhost:3000/api | ✅ |
| 🏛️ City-Hall | http://localhost:5173 | ✅ |
| 🔐 Admin Panel | http://localhost:5174 | ✅ |
| 🛣️ Roads | http://localhost:5180 | ✅ |
| 💡 Lighting | http://localhost:5181 | ✅ |
| 🗑️ Waste | http://localhost:5182 | ✅ |
| 🌳 Parks | http://localhost:5183 | ✅ |
| 🚰 Water | http://localhost:5184 | ✅ |
| 🚌 Transport | http://localhost:5185 | ✅ |
| 🌿 Ecology | http://localhost:5186 | ✅ |
| 🎨 Vandalism | http://localhost:5187 | ✅ |

---

## 🧪 ТЕСТУВАННЯ

### Повний тест:
```bash
./test_system_full.sh
```

### Швидка перевірка:
```bash
# Перевірка портів
lsof -ti:3000 && echo "Backend OK"
lsof -ti:9000 && echo "Monitor OK"
lsof -ti:5173 && echo "City-Hall OK"
lsof -ti:5174 && echo "Admin OK"
lsof -ti:8083 && echo "Expo Parent OK"
```

---

## 📁 ДОКУМЕНТАЦІЯ

| Файл | Призначення |
|------|-------------|
| **FINAL_INSTRUCTIONS.md** | 📘 Повна інструкція (все в одному) |
| **README.md** | 📖 Головна документація |
| **ROADMAP.md** | 🗺️ План розробки |
| **EXPO_PARENT_GUIDE.md** | 📱 Інструкція Expo Parent |
| **TEST_REPORT_2026-03-23.md** | 🧪 Звіт тестування |
| **AUTO_START_GUIDE.md** | ⚙️ Автозапуск macOS |

---

## 🛠 ВИРІШЕННЯ ПРОБЛЕМ

### Backend не працює:
```bash
lsof -ti:3000 | xargs kill -9
npm run api
```

### Monitor Dashboard не працює:
```bash
lsof -ti:9000 | xargs kill -9
cd monitor && node server.js
```

### Expo Parent не підключається:
```bash
# 1. Перевірити Backend
curl http://localhost:3000/api/health

# 2. Перезапустити Expo
./stop_parent.sh
./start_parent.sh

# 3. Оновити IP в mobile-parent/config.ts
```

### Департамент не працює:
```bash
# Звільнити порт (наприклад, 5180)
lsof -ti:5180 | xargs kill -9

# Запустити знову через start.sh
```

---

## 📋 ЩО ЗАПУЩЕНО

✅ **Працюють (12):**
- Backend API (3000)
- Monitor Dashboard (9000)
- City-Hall (5173)
- Admin Panel (5174)
- 8 Департаментів (5180-5187)
- Expo Parent (8083)

⏸️ **Не запущені (8):**
- Telegram боти (інтегровані в Backend)
- Staff Panel (5176)
- Expo School (8082)
- Expo Client (8081)

---

## 🎯 ЩО ПОТРІБНО ЗРОБИТИ

### 🔴 Критичні:
- [ ] Налаштувати Telegram ботів (токени в @BotFather)
- [ ] Додати TELEGRAM_BOT_TOKEN в .env

### 🟡 Важливі:
- [ ] Запустити Expo School (8082)
- [ ] Запустити Expo Client (8081)
- [ ] Налаштувати фото-верифікацію

### 🟢 Бажані:
- [ ] Redis для кешування
- [ ] PostgreSQL міграція
- [ ] Docker контейнеризація

---

## 💡 КОРИСНІ КОМАНДИ

```bash
# Перегляд логів в реальному часі
tail -f /tmp/BackendAPIAPImode.log
tail -f /tmp/expo-parent.log
tail -f /tmp/Monitor.log

# Перевірка бази даних
sqlite3 prisma/dev.db "SELECT COUNT(*) FROM User;"

# Очистити кеш тільки одного сервісу
./stop_parent.sh && ./start_parent.sh

# Дізнатися IP Mac
ifconfig en0 | grep inet
```

---

**Шпаргалка оновлена:** 2026-03-23  
**Збережено:** `/Users/apple/Desktop/GenTrust_Mobility_DE/QUICK_START.md`

---

*Ця шпаргалка містить все необхідне для щоденної роботи*
