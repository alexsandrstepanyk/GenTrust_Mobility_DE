# 🧪 GenTrust Mobility - Testing Framework

## 📋 Огляд

Ця папка містить тести для перевірки всієї системи GenTrust Mobility.

## 📁 Структура

```
tests/
├── system/                    # Системні тести
│   ├── test_all_services.sh   # Повний тест всіх сервісів
│   └── results/               # Результати тестів
├── monitor/                   # Тести моніторингу
│   └── test_monitor_dashboard.sh
└── README.md                  # Цей файл
```

## 🚀 Використання

### Повний системний тест

```bash
# Запустити всі тести
bash tests/system/test_all_services.sh

# Результати зберігаються в:
# tests/system/results/test_results_YYYY-MM-DD_HH-MM-SS.txt
```

### Тест моніторингу

```bash
# Запустити тест моніторингу
bash tests/monitor/test_monitor_dashboard.sh
```

## 📊 Що тестується

### 1️⃣ Тестування портів

Перевіряє чи всі порти зайняті правильними сервісами:

| Порт | Сервіс | Очікуваний статус |
|------|--------|-------------------|
| 3000 | Backend API | ✅ ЗАЙНЯТИЙ |
| 9000 | Monitor Dashboard | ✅ ЗАЙНЯТИЙ |
| 5173 | City-Hall Dashboard | ✅ ЗАЙНЯТИЙ |
| 5174 | Admin Panel | ✅ ЗАЙНЯТИЙ |
| 5175 | Department Dashboard (Base) | ✅ ЗАЙНЯТИЙ |
| 5180 | Dept: Roads (🛣️) | ✅ ЗАЙНЯТИЙ |
| 5181 | Dept: Lighting (💡) | ✅ ЗАЙНЯТИЙ |
| 5182 | Dept: Waste (🗑️) | ✅ ЗАЙНЯТИЙ |
| 5183 | Dept: Parks (🌳) | ✅ ЗАЙНЯТИЙ |
| 5184 | Dept: Water (🚰) | ✅ ЗАЙНЯТИЙ |
| 5185 | Dept: Transport (🚌) | ✅ ЗАЙНЯТИЙ |
| 5186 | Dept: Ecology (🌿) | ✅ ЗАЙНЯТИЙ |
| 5187 | Dept: Vandalism (🎨) | ✅ ЗАЙНЯТИЙ |

### 2️⃣ Тестування API Endpoints

Перевіряє доступність API endpoint'ів:

- `GET /api/health` - Health check (очікується 200)
- `GET /api/reports` - Reports API (очікується 200)
- `GET /api/users` - Users API (очікується 200)
- `GET /api/stats/dashboard` - Stats API (очікується 401 - потребує auth)

### 3️⃣ Тестування лог файлів

Перевіряє наявність та валідність лог файлів:

- `/tmp/BackendAPIзботами.log`
- `/tmp/Monitor.log`
- `/tmp/City-HallDashboard.log`
- `/tmp/AdminPanelCoreDashboard.log`
- `/tmp/DepartmentDashboard.log`
- `/tmp/Dept:Roads.log`
- `/tmp/Dept:Lighting.log`
- `/tmp/Dept:Waste.log`
- `/tmp/Dept:Parks.log`
- `/tmp/Dept:Water.log`
- `/tmp/Dept:Transport.log`
- `/tmp/Dept:Ecology.log`
- `/tmp/Dept:Vandalism.log`

### 4️⃣ Тестування бази даних

Перевіряє наявність та цілісність головної бази даних:

- `prisma/dev.db` - Головна SQLite база

### 5️⃣ Перевірка процесів

Перевіряє що запущено достатньо процесів Node.js (> 10)

## 📈 Результати тестів

### Приклад успішного результку:

```
╔════════════════════════════════════════════════════════╗
║  ПІДСУМКИ ТЕСТУВАННЯ
╚════════════════════════════════════════════════════════╝

Всього тестів: 25
✅ Пройдено: 25
❌ Не пройдено: 0

Успішність: 100%

🎉 ВСІ ТЕСТИ ПРОЙДЕНО УСПІШНО!

Доступні посилання:
  🌐 Monitor:        http://localhost:9000
  🔧 Backend API:    http://localhost:3000/api
  🏛️ City-Hall:      http://localhost:5173
  🔐 Admin Panel:    http://localhost:5174
  🏢 Departments:    http://localhost:5180-5187
```

### Приклад невдалого результату:

```
╔════════════════════════════════════════════════════════╗
║  ПІДСУМКИ ТЕСТУВАННЯ
╚════════════════════════════════════════════════════════╝

Всього тестів: 25
✅ Пройдено: 23
❌ Не пройдено: 2

Успішність: 92%

⚠️  ДЕЯКІ ТЕСТИ НЕ ПРОЙДЕНО

Рекомендації:
  1. Перевірте логи невдалих сервісів
  2. Спробуйте перезапустити: bash start.sh
  3. Перевірте конфігурацію портів
```

## 🔧 Виправлення проблем

### Проблема: Порт не зайнятий

**Рішення:**
```bash
# Перезапустити систему
bash stop.sh
bash start.sh
```

### Проблема: Лог файл не знайдено

**Рішення:**
```bash
# Перевірити чи сервіс запущено
ps aux | grep vite | grep <port>

# Перевірити лог напряму
tail -f /tmp/<service>.log
```

### Проблема: API повертає помилку

**Рішення:**
```bash
# Перевірити Backend
curl http://localhost:3000/api/health

# Перевірити логи Backend
tail -f /tmp/BackendAPIзботами.log
```

## 📝 Автоматизація в CI/CD

Для використання в CI/CD:

```yaml
# .github/workflows/test.yml
name: System Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '20'
      
      - name: Install dependencies
        run: npm install
      
      - name: Start system
        run: bash start.sh &
        sleep 60
      
      - name: Run tests
        run: bash tests/system/test_all_services.sh
```

## 🎯 Best Practices

1. **Запускайте тести після кожного деплою**
2. **Зберігайте результати тестів** в `tests/system/results/`
3. **Перевіряйте логи** при невдачі тестів
4. **Автоматизуйте** запуск тестів в CI/CD

## 📞 Підтримка

Якщо тести не працюють:

1. Перевірте що система запущена: `bash start.sh`
2. Перевірте що всі порти вільні перед запуском
3. Перегляньте логи в `tests/system/results/`

---

**Last Updated:** 2026-03-06  
**Version:** v1.0  
**Status:** ✅ Production Ready
