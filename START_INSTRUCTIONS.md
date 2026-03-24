# 🚀 GENTRUST MOBILITY - ІНСТРУКЦІЯ З ЗАПУСКУ

**Версія:** v6.0.6  
**Дата:** 2026-03-23

---

## 📋 ОПЦІЇ ЗАПУСКУ

### 1. Запуск всіх сервісів

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start.sh
```

**Запускає:**
- Backend API (3000)
- Monitor Dashboard (9000)
- City-Hall Dashboard (5173)
- Admin Panel (5174)
- 8 Департаментів (5180-5187)

**Час запуску:** ~60 секунд

---

### 2. Запуск тільки Expo Parent (НОВЕ!)

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start.sh --parent-only
```

**Запускає:**
- Expo Parent App (8083)

**Час запуску:** ~15 секунд

**URL:** `exp://192.168.178.34:8083`  
**Логін:** `admin@parent.com` / `admin`

---

### 3. Запуск тільки Backend API

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start.sh --api-only
```

**Запускає:**
- Backend API (3000) без Telegram ботів

**URL:** `http://localhost:3000/api`

---

### 4. Запуск тільки Admin Panel

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start.sh --admin-only
```

**Запускає:**
- Admin Panel (5174)

**URL:** `http://localhost:5174`  
**Логін:** `admin` / `admin`

---

### 5. Запуск тільки Department Dashboard

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start.sh --dept-only
```

**Запускає:**
- Department Dashboard Base (5175)

**URL:** `http://localhost:5175`

---

## 🛑 ЗУПИНКА

### Зупинити всі сервіси:

```bash
killall -9 node npm vite expo ts-node nodemon
```

### Зупинити по портах:

```bash
lsof -ti:3000 | xargs kill -9  # Backend
lsof -ti:9000 | xargs kill -9  # Monitor
lsof -ti:5173 | xargs kill -9  # City-Hall
lsof -ti:5174 | xargs kill -9  # Admin
lsof -ti:8083 | xargs kill -9  # Expo Parent
```

---

## 📱 EXPO PARENT - ПІДКЛЮЧЕННЯ

### На телефоні:

1. Відкрийте **Expo Go**
2. Введіть: `exp://192.168.178.34:8083`
3. Натисніть "Load"
4. Логін: `admin@parent.com` / `admin`

### Зміна мови:

1. Профіль → Налаштування → Мова
2. Обрати: English / Deutsch / Українська / Русский / Français

---

## 📊 ПЕРЕВІРКА СТАТУСУ

### Monitor Dashboard:

```bash
open http://localhost:9000
```

### API Status:

```bash
curl http://localhost:9000/api/status | python3 -m json.tool
```

### Тестова команда:

```bash
./test_system_full.sh
```

---

## 📁 ВСІ ПОРТИ

| Сервіс | Порт | URL |
|--------|------|-----|
| Backend API | 3000 | http://localhost:3000/api |
| Monitor Dashboard | 9000 | http://localhost:9000 |
| City-Hall Dashboard | 5173 | http://localhost:5173 |
| Admin Panel | 5174 | http://localhost:5174 |
| Department Base | 5175 | http://localhost:5175 |
| Roads Department | 5180 | http://localhost:5180 |
| Lighting Department | 5181 | http://localhost:5181 |
| Waste Department | 5182 | http://localhost:5182 |
| Parks Department | 5183 | http://localhost:5183 |
| Water Department | 5184 | http://localhost:5184 |
| Transport Department | 5185 | http://localhost:5185 |
| Ecology Department | 5186 | http://localhost:5186 |
| Vandalism Department | 5187 | http://localhost:5187 |
| Expo Parent | 8083 | exp://192.168.178.34:8083 |

---

## 🐛 ВИРІШЕННЯ ПРОБЛЕМ

### Backend не запускається:

```bash
lsof -ti:3000 | xargs kill -9
npm run api
```

### Expo Parent не запускається:

```bash
lsof -ti:8083 | xargs kill -9
cd mobile-parent
node node_modules/@expo/cli/build/bin/cli start --port 8083 --lan --clear
```

### Monitor Dashboard не працює:

```bash
lsof -ti:9000 | xargs kill -9
cd monitor
node server.js
```

---

**Готово! Ця інструкція дозволяє швидко запустити проект! 🚀**

---

*Створено: 2026-03-23*  
*Версія: v6.0.6*
