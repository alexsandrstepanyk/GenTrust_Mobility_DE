# 🚀 START.SH - ПОВНИЙ ПОРЯДОК ЗАПУСКУ

**Дата:** 2026-03-08
**Версія:** v5.3.2
**Статус:** ✅ ВСІ СЕРВІСИ ПРАЦЮЮТЬ

---

## 📋 ЗАПУСК ОДНІЄЮ КОМАНДОЮ

```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
./start.sh
```

**Це запустить ВСІ сервіси в правильному порядку!**

---

## 🎯 ПОРЯДОК ЗАПУСКУ (всередині start.sh)

### Крок 1: Моніторинг (порт 9000)
```bash
cd monitor
node server.js > /tmp/Monitor.log 2>&1 &
```
**URL:** http://localhost:9000
**Призначення:** Моніторинг всіх сервісів, real-time логи

---

### Крок 2: Backend API (порт 3000) - ЗАВЖДИ ПЕРШИМ!
```bash
npm run api
```
**URL:** http://localhost:3000/api
**Призначення:** 
- API для всіх дашбордів
- Боти (Master, City Hall, Quest Provider, Municipal)
- Prisma ORM (головна БД + 8 департаментів)
- Gemini AI

**Чекаємо готовність:** до 60 секунд

---

### Крок 3: City-Hall Dashboard (порт 5173)
```bash
cd city-hall-dashboard
npm run dev
```
**URL:** http://localhost:5173
**Призначення:** Мерія бачить ВСІ звіти (100+)

---

### Крок 4: Admin Panel (порт 5174)
```bash
cd admin-panel
npm run dev
```
**URL:** http://localhost:5174
**Призначення:** Управління користувачами, модерація

---

### Крок 5: Department Dashboard Base (порт 5175)
```bash
cd department-dashboard
npm run dev
```
**URL:** http://localhost:5175
**Призначення:** Базовий шаблон

---

### Крок 6: 8 Департаментів (порти 5180-5187)

**Кожен на свій фіксований порт:**

```bash
# 🛣️ Дороги (5180)
cd departments/roads && npm run dev

# 💡 Освітлення (5181)
cd departments/lighting && npm run dev

# 🗑️ Сміття (5182)
cd departments/waste && npm run dev

# 🌳 Парки (5183)
cd departments/parks && npm run dev

# 🚰 Вода (5184)
cd departments/water && npm run dev

# 🚌 Транспорт (5185)
cd departments/transport && npm run dev

# 🌿 Екологія (5186)
cd departments/ecology && npm run dev

# 🎨 Вандалізм (5187)
cd departments/vandalism && npm run dev
```

**Призначення:** Кожен департамент обробляє свої звіти

---

## 📊 ПІДСУМКОВА ТАБЛИЦЯ СЕРВІСІВ

| # | Сервіс | Порт | URL | Лог |
|---|--------|------|-----|-----|
| 1 | **Monitor** | 9000 | http://localhost:9000 | /tmp/Monitor.log |
| 2 | **Backend API** | 3000 | http://localhost:3000/api | /tmp/BackendAPI.log |
| 3 | **City-Hall** | 5173 | http://localhost:5173 | /tmp/City-HallDashboard.log |
| 4 | **Admin Panel** | 5174 | http://localhost:5174 | /tmp/AdminPanel.log |
| 5 | **Dept Base** | 5175 | http://localhost:5175 | /tmp/DepartmentDashboard.log |
| 6 | **Roads** | 5180 | http://localhost:5180 | /tmp/roads.log |
| 7 | **Lighting** | 5181 | http://localhost:5181 | /tmp/lighting.log |
| 8 | **Waste** | 5182 | http://localhost:5182 | /tmp/waste.log |
| 9 | **Parks** | 5183 | http://localhost:5183 | /tmp/parks.log |
| 10 | **Water** | 5184 | http://localhost:5184 | /tmp/water.log |
| 11 | **Transport** | 5185 | http://localhost:5185 | /tmp/transport.log |
| 12 | **Ecology** | 5186 | http://localhost:5186 | /tmp/ecology.log |
| 13 | **Vandalism** | 5187 | http://localhost:5187 | /tmp/vandalism.log |

---

## ✅ ПЕРЕВІРКА РОБОТИ

### 1. Відкрити Monitor:
```
http://localhost:9000
```
- Показує статус всіх 13 сервісів
- Real-time логи
- Зайняті порти

### 2. Перевірити Backend:
```bash
curl http://localhost:3000/api/reports/department/roads?limit=50
```
**Очікується:** 16 звітів

### 3. Перевірити City-Hall:
```
http://localhost:5173/reports
```
**Очікується:** 100+ звітів

### 4. Перевірити департаменти:
```
http://localhost:5180/reports  # Roads: 16 звітів
http://localhost:5181/reports  # Lighting: 15 звітів
http://localhost:5182/reports  # Waste: 16 звітів
```

### 5. Console (F12):
```
📂 ROADS: Завантажено 16 звітів (фільтр: ALL)
📂 LIGHTING: Завантажено 15 звітів (фільтр: ALL)
📂 WASTE: Завантажено 16 звітів (фільтр: ALL)
```

---

## 🔧 ДОДАТКОВІ ОПЦІЇ ЗАПУСКУ

### Тільки API (без ботів):
```bash
./start.sh --api-only
```

### Тільки Staff Panel:
```bash
./start.sh --staff-only
```

### Тільки Admin Panel:
```bash
./start.sh --admin-only
```

### Тільки Department Dashboard:
```bash
./start.sh --dept-only
```

### З мобільними додатками:
```bash
./start.sh --with-all-apps
```

---

## 🛠️ ВИРІШЕННЯ ПРОБЛЕМ

### Порт зайнятий:
```bash
lsof -ti:5180 | xargs kill -9
./start.sh
```

### Backend не запускається:
```bash
tail -f /tmp/BackendAPI.log
lsof -ti:3000 | xargs kill -9
npm run api
```

### Vite не запускається:
```bash
cd departments/roads
rm -rf node_modules/.vite
npm run dev
```

### CORS помилки:
```bash
# Перевірити api.ts
grep "API_BASE_URL" departments/roads/src/lib/api.ts
# Має бути: const API_BASE_URL = '/api';
```

---

## 📝 ЛОГИ

### Перегляд:
```bash
# Backend
tail -f /tmp/BackendAPI.log

# Monitor
tail -f /tmp/Monitor.log

# Департаменти
tail -f /tmp/roads.log
tail -f /tmp/lighting.log
# ... і т.д.

# Всі логи
tail -f /tmp/*.log
```

---

## 🎯 ПРАВИЛА

### 1. Фіксовані порти:
```
✅ Кожен сервіс має СВІЙ фіксований порт
✅ Ніхто інший НЕ МАЄ ПРАВА займати чужий порт
✅ Якщо порт зайнятий - ВБИВАЄМО порушника
```

### 2. Порядок запуску:
```
✅ 1. Monitor (9000)
✅ 2. Backend API (3000) - ЗАВЖДИ ПЕРШИМ!
✅ 3. City-Hall (5173) - після Backend
✅ 4. Admin Panel (5174) - після Backend
✅ 5. Department Base (5175) - після Backend
✅ 6. 8 Департаментів (5180-5187) - після Backend
```

### 3. Безпека портів:
```
⚠️  Твій діапазон: 3000 - 9000
❌  ЗАБОРОНЕНО чіпати порти ПОЗА цим діапазоном
```

---

## ✅ ПІДСУМОК

**start.sh робить все автоматично:**

1. ✅ Вбиває старі процеси на портах
2. ✅ Запускає Monitor (9000)
3. ✅ Запускає Backend API (3000)
4. ✅ Чекає готовності Backend
5. ✅ Запускає City-Hall (5173)
6. ✅ Запускає Admin Panel (5174)
7. ✅ Запускає Department Base (5175)
8. ✅ Запускає 8 Департаментів (5180-5187)
9. ✅ Відкриває Monitor в браузері

**Просто виконай:**
```bash
./start.sh
```

**І все працює!** 🎉

---

**Generated:** 2026-03-08
**Version:** v5.3.2
**Status:** ✅ All Services Running
