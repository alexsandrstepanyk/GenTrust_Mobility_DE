# 🚀 START.SH - ІНСТРУКЦІЯ ЗАПУСКУ

**Дата:** 2026-03-08
**Версія:** v5.3.2
**Статус:** ✅ ВСІ СЕРВІСИ ПРАЦЮЮТЬ

---

## 📋 ПОРЯДОК ЗАПУСКУ СЕРВІСІВ

### start.sh запускає сервіси в такому порядку:

```bash
# 1️⃣ СИСТЕМА МОНІТОРИНГУ (порт 9000)
✅ monitor/server.js → http://localhost:9000
   - Моніторинг всіх сервісів
   - Real-time логи
   - Статус портів

# 2️⃣ BACKEND API (порт 3000) - ЗАВЖДИ ПЕРШИМ!
✅ npm run api → http://localhost:3000/api
   - API для всіх дашбордів
   - Боти (Master, City Hall, Quest Provider, Municipal)
   - Prisma ORM
   - Gemini AI

# 3️⃣ CITY-HALL DASHBOARD (порт 5173)
✅ npm run dev (city-hall-dashboard) → http://localhost:5173
   - Мерія бачить ВСІ звіти (100+)
   - Статистика по всіх 8 департаментах
   - AI Recommendations
   - Модерація звітів

# 4️⃣ ADMIN PANEL (порт 5174)
✅ npm run dev (admin-panel) → http://localhost:5174
   - Управління користувачами
   - Модерація
   - Статистика

# 5️⃣ DEPARTMENT DASHBOARD BASE (порт 5175)
✅ npm run dev (department-dashboard) → http://localhost:5175
   - Базовий шаблон для департаментів

# 6️⃣ 8 ДЕПАРТАМЕНТІВ (порти 5180-5187)
✅ Кожен департамент на СВІЙ фіксований порт:

5180 → departments/roads (🛣️ Дороги)
5181 → departments/lighting (💡 Освітлення)
5182 → departments/waste (🗑️ Сміття)
5183 → departments/parks (🌳 Парки)
5184 → departments/water (🚰 Вода)
5185 → departments/transport (🚌 Транспорт)
5186 → departments/ecology (🌿 Екологія)
5187 → departments/vandalism (🎨 Вандалізм)

Кожен департамент:
- ✅ Власна БД (databases/{dept}_dept.db)
- ✅ 10-16 тестових звітів
- ✅ Ідентичний функціонал
- ✅ Ідентичний дизайн
- ✅ Vite proxy на /api
```

---

## 🎯 ЯК ЗАПУСТИТИ

### 1. Основний запуск (всі сервіси):
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start.sh
```

### 2. Тільки API (без ботів):
```bash
./start.sh --api-only
```

### 3. Тільки Staff Panel:
```bash
./start.sh --staff-only
```

### 4. Тільки Admin Panel:
```bash
./start.sh --admin-only
```

### 5. Тільки Department Dashboard:
```bash
./start.sh --dept-only
```

### 6. З мобільними додатками:
```bash
./start.sh --with-all-apps
```

---

## 📊 ПОРТИ ВСІХ СЕРВІСІВ

| Сервіс | Порт | URL | Лог | Статус |
|--------|------|-----|-----|--------|
| **Backend API** | 3000 | http://localhost:3000/api | /tmp/BackendAPI.log | ✅ |
| **Monitor** | 9000 | http://localhost:9000 | /tmp/Monitor.log | ✅ |
| **City-Hall** | 5173 | http://localhost:5173 | /tmp/City-HallDashboard.log | ✅ |
| **Admin Panel** | 5174 | http://localhost:5174 | /tmp/AdminPanel.log | ✅ |
| **Dept Base** | 5175 | http://localhost:5175 | /tmp/DepartmentDashboard.log | ✅ |
| **Roads** | 5180 | http://localhost:5180 | /tmp/roads.log | ✅ |
| **Lighting** | 5181 | http://localhost:5181 | /tmp/lighting.log | ✅ |
| **Waste** | 5182 | http://localhost:5182 | /tmp/waste.log | ✅ |
| **Parks** | 5183 | http://localhost:5183 | /tmp/parks.log | ✅ |
| **Water** | 5184 | http://localhost:5184 | /tmp/water.log | ✅ |
| **Transport** | 5185 | http://localhost:5185 | /tmp/transport.log | ✅ |
| **Ecology** | 5186 | http://localhost:5186 | /tmp/ecology.log | ✅ |
| **Vandalism** | 5187 | http://localhost:5187 | /tmp/vandalism.log | ✅ |

---

## 🔧 ПРАВИЛА ЗАПУСКУ

### 1. Фіксовані порти:
```
✅ Кожен сервіс має СВІЙ фіксований порт (назавжди)
✅ Ніхто інший НЕ МАЄ ПРАВА займати чужий порт
✅ Якщо порт зайнятий - ВБИВАЄМО порушника
```

### 2. Порядок запуску:
```
✅ 1. Monitor (9000) - моніторинг
✅ 2. Backend API (3000) - база для всіх
✅ 3. City-Hall Dashboard (5173) - після Backend
✅ 4. Admin Panel (5174) - після Backend
✅ 5. Department Dashboard (5175) - після Backend
✅ 6. 8 Департаментів (5180-5187) - після Backend
```

### 3. Перевірка готовності Backend:
```bash
# Чекаємо поки Backend буде готовий (до 60 сек)
curl http://localhost:3000/api/health
# Має повернути: {"status":"ok"}
```

### 4. Безпека портів:
```
⚠️  Твій діапазон: 3000 - 9000
❌  ЗАБОРОНЕНО чіпати порти ПОЗА цим діапазоном
❌  НЕ зупиняти: MySQL (3306), Redis (6379), MongoDB (27017), PostgreSQL (5432)
```

---

## 🧪 ПЕРЕВІРКА РОБОТИ

### 1. Відкрити Monitor:
```
http://localhost:9000
```
- Показує статус всіх сервісів
- Real-time логи
- Зайняті порти

### 2. Перевірити Backend API:
```bash
curl http://localhost:3000/api/reports/department/roads?limit=50
# Має повернути: 16 звітів
```

### 3. Перевірити City-Hall:
```
http://localhost:5173/reports
# Має показати: 100+ звітів
```

### 4. Перевірити департаменти:
```
http://localhost:5180/reports  # Roads - 16 звітів
http://localhost:5181/reports  # Lighting - 15 звітів
http://localhost:5182/reports  # Waste - 16 звітів
...
```

### 5. Console log (F12):
```
📂 ROADS: Завантажено 16 звітів (фільтр: ALL)
📂 LIGHTING: Завантажено 15 звітів (фільтр: ALL)
📂 WASTE: Завантажено 16 звітів (фільтр: ALL)
```

---

## 🛠️ ВИРІШЕННЯ ПРОБЛЕМ

### Проблема 1: Порт зайнятий
```bash
# Вбити процес на порту
lsof -ti:5180 | xargs kill -9

# Перезапустити сервіс
./start.sh
```

### Проблема 2: Backend не запускається
```bash
# Перевірити логи
tail -f /tmp/BackendAPI.log

# Перезапустити
lsof -ti:3000 | xargs kill -9
npm run api
```

### Проблема 3: Vite не запускається
```bash
# Очистити кеш
cd departments/roads
rm -rf node_modules/.vite

# Перезапустити
npm run dev
```

### Проблема 4: CORS помилки
```bash
# Перевірити api.ts
grep "API_BASE_URL" departments/roads/src/lib/api.ts
# Має бути: const API_BASE_URL = '/api';

# Якщо ні - виправити і перезапустити Vite
```

---

## 📝 ЛОГИ СЕРВІСІВ

### Перегляд логів:
```bash
# Backend API
tail -f /tmp/BackendAPI.log

# Monitor
tail -f /tmp/Monitor.log

# City-Hall
tail -f /tmp/City-HallDashboard.log

# Департаменти
tail -f /tmp/roads.log
tail -f /tmp/lighting.log
tail -f /tmp/waste.log
# ... і т.д.

# Всі логи одночасно
tail -f /tmp/*.log
```

---

## ✅ ФІНАЛЬНА ПЕРЕВІРКА

```bash
# 1. Перевірити всі порти
lsof -i :3000,5173,5174,5175,5180,5181,5182,5183,5184,5185,5186,5187,9000 | grep LISTEN

# 2. Перевірити API
curl http://localhost:3000/api/reports/department/roads?limit=50 | python3 -c "import sys,json; print(f'Roads: {len(json.load(sys.stdin))} звітів')"

# 3. Перевірити дашборди
for port in 5180 5181 5182; do
  curl -s "http://localhost:$port/" | grep -o "<title>.*</title>"
done
```

**Очікуваний результат:**
```
✅ Всі порти LISTEN
✅ Roads: 16 звітів
✅ <title>🛣️ Дороги - GenTrust Mobility</title>
✅ <title>💡 Освітлення - GenTrust Mobility</title>
✅ <title>🗑️ Сміття - GenTrust Mobility</title>
```

---

## 🎯 ВИСНОВКИ

### ✅ start.sh запускає:
1. ✅ Monitor (9000) - моніторинг
2. ✅ Backend API (3000) - база
3. ✅ City-Hall Dashboard (5173)
4. ✅ Admin Panel (5174)
5. ✅ Department Dashboard Base (5175)
6. ✅ 8 Департаментів (5180-5187)

### ✅ Всі сервіси працюють ідентично:
- ✅ Однаковий дизайн
- ✅ Однаковий функціонал
- ✅ Однакові API endpoints
- ✅ Однакові фільтри
- ✅ Однакові компоненти

### ✅ Все задокументовано:
- ✅ start.sh - порядок запуску
- ✅ ROADMAP_UPDATED.md - історія змін
- ✅ DEPARTMENT_UNIFICATION_COMPLETE.md - уніфікація
- ✅ DESIGN_UNIFICATION_VERIFICATION.md - дизайн
- ✅ FUNCTIONAL_UNIFICATION_VERIFICATION.md - функціонал

---

**Generated:** 2026-03-08
**Version:** v5.3.2
**Status:** ✅ All Services Running
