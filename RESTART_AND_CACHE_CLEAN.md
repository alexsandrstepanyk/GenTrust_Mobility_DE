# 🔄 ПЕРЕЗАПУСК СИСТЕМИ ТА ОЧИЩЕННЯ КЕШУ

**Дата:** 2026-03-08
**Статус:** ✅ ВСІ СЕРВІСИ ПРАЦЮЮТЬ
**Версія:** v5.2.5

---

## ✅ ПОТОЧНИЙ СТАН СИСТЕМИ

### Backend API (порт 3000):
```bash
✅ Працює
✅ /api/reports/department/roads → 16 звітів
✅ /api/reports/department/roads?status=PENDING → 8 звітів
```

### Department Dashboards:
```
✅ 5180 - Roads (🛣️ Дороги) - Працює
✅ 5181 - Lighting (💡 Освітлення) - Працює
✅ 5182 - Waste (🗑️ Сміття) - Працює
✅ 5183 - Parks (🌳 Парки) - Працює
✅ 5184 - Water (🚰 Вода) - Працює
✅ 5185 - Transport (🚌 Транспорт) - Працює
✅ 5186 - Ecology (🌿 Екологія) - Працює
✅ 5187 - Vandalism (🎨 Вандалізм) - Працює
```

### City-Hall Dashboard:
```
✅ 5173 - City-Hall (🏛️) - Працює
```

---

## 🧪 ПЕРЕВІРКА РОБОТИ

### 1. Тестова сторінка:
```bash
open /Users/apple/Desktop/GenTrust_Mobility_DE/test_dashboard.html
```

Або відкрийте в браузері:
```
file:///Users/apple/Desktop/GenTrust_Mobility_DE/test_dashboard.html
```

### 2. Direct API Tests:
```bash
# Всі roads звіти
curl "http://localhost:3000/api/reports/department/roads?limit=50"
# ✅ 16 звітів

# Roads + PENDING
curl "http://localhost:3000/api/reports/department/roads?status=PENDING&limit=50"
# ✅ 8 звітів

# Roads + APPROVED
curl "http://localhost:3000/api/reports/department/roads?status=APPROVED&limit=50"
# ✅ 2 звіти
```

### 3. Dashboard URLs:
```
http://localhost:5180/reports  # Roads
http://localhost:5181/reports  # Lighting
http://localhost:5182/reports  # Waste
http://localhost:5183/reports  # Parks
http://localhost:5184/reports  # Water
http://localhost:5185/reports  # Transport
http://localhost:5186/reports  # Ecology
http://localhost:5187/reports  # Vandalism
http://localhost:5173/reports  # City-Hall
```

---

## 🧹 ОЧИЩЕННЯ КЕШУ (ЯКЩО ЩОСЬ НЕ ПРАЦЮЄ)

### 1. Очистити кеш Vite:
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE/departments/roads
rm -rf node_modules/.vite dist
```

### 2. Вбити Vite процеси:
```bash
lsof -ti:5180,5181,5182,5183,5184,5185,5186,5187 | xargs kill -9
```

### 3. Перезапустити дашборди:
```bash
cd /Users/apple/Desktop/GenTrust_Mobility_DE
for dept in roads lighting waste parks water transport ecology vandalism; do
  (cd departments/$dept && npm run dev > /tmp/${dept}.log 2>&1 &)
  sleep 1
done
```

### 4. Очистити кеш браузера:
- **Chrome/Edge:** `Ctrl+Shift+Delete` → Clear cache
- **Firefox:** `Ctrl+Shift+Delete` → Clear cache
- **Safari:** `Cmd+Option+E` → Empty caches

### 5. Hard Reload в браузері:
- **Windows/Linux:** `Ctrl+Shift+R`
- **Mac:** `Cmd+Shift+R`

---

## 🔍 ДІАГНОСТИКА

### Перевірити чи Vite працює:
```bash
curl -s "http://localhost:5180/" | grep -o "<title>.*</title>"
# Має показати: <title>🛣️ Дороги - GenTrust Mobility</title>
```

### Перевірити код в Vite:
```bash
curl -s "http://localhost:5180/src/lib/api.ts" | grep -A3 "getReports:"
# Має показати: params?.status && params.status !== "ALL"
```

### Перевірити Backend API:
```bash
curl -s "http://localhost:3000/api/reports/department/roads?limit=50" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))"
# Має показати: 16
```

### Перевірити порти:
```bash
lsof -i :5180-5187 | grep LISTEN
# Має показати всі 8 портів
```

---

## 📝 КОНСОЛЬНІ ЛОГИ

### Roads Dashboard:
```bash
tail -f /tmp/roads.log
```

### Всі логи:
```bash
tail -f /tmp/{roads,lighting,waste,parks,water,transport,ecology,vandalism}.log
```

### Backend API:
```bash
tail -f /tmp/BackendAPI.log  # або server_logs.txt
```

---

## 🎯 ЯК ПРАВИЛЬНО ВІДКРИВАТИ ДАШБОРД

### 1. Відкрийте Chrome/Brave:
```
http://localhost:5180/reports
```

### 2. Відкрийте DevTools (F12):
- Console → має показати: `📂 ROADS: Завантажено 16 звітів (фільтр: ALL)`

### 3. Оберіть фільтр "На розгляді":
- Console → має показати: `📂 ROADS: Завантажено 8 звітів (фільтр: PENDING)`
- Сторінка → має показати 8 звітів

### 4. Оберіть фільтр "ВСІ":
- Console → має показати: `📂 ROADS: Завантажено 16 звітів (фільтр: ALL)`
- Сторінка → має показати 16 звітів

---

## ⚠️ МОЖЛИВІ ПРОБЛЕМИ ТА РІШЕННЯ

### Проблема 1: "Немає звітів за обраним фільтром"

**Причина:** Кеш Vite або браузера

**Рішення:**
```bash
# 1. Вбити Vite
lsof -ti:5180 | xargs kill -9

# 2. Очистити кеш
cd departments/roads && rm -rf node_modules/.vite dist

# 3. Перезапустити
npm run dev

# 4. Hard Reload в браузері
Ctrl+Shift+R
```

### Проблема 2: Vite не запускається

**Причина:** Порт зайнятий

**Рішення:**
```bash
lsof -ti:5180 | xargs kill -9
npm run dev
```

### Проблема 3: API повертає 0 звітів

**Причина:** Неправильний URL

**Рішення:**
```bash
# Правильний URL:
curl "http://localhost:3000/api/reports/department/roads?limit=50"

# НЕПРАВИЛЬний URL (не працює):
curl "http://localhost:3000/api/reports?category=roads"
```

---

## ✅ ФІНАЛЬНА ПЕРЕВІРКА

```bash
# 1. Backend API
curl -s "http://localhost:3000/api/reports/department/roads?limit=50" | python3 -c "import sys,json; d=json.load(sys.stdin); print(f'Backend: {len(d)} звітів')"

# 2. Vite код
curl -s "http://localhost:5180/src/lib/api.ts" | grep -c "params.status !== \"ALL\"" && echo "Vite код: ✅"

# 3. Порти
lsof -i :5180 | grep LISTEN && echo "Port 5180: ✅"
```

**Очікуваний результат:**
```
Backend: 16 звітів
Vite код: ✅
Port 5180: ✅
```

---

**Generated:** 2026-03-08
**Version:** v5.2.5
**Status:** ✅ All Services Running
