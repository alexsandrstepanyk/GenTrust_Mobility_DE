# 🧪 GenTrust Mobility - Testing Framework

## 📁 Структура Папки Test

```
tests/
├── monitor/                    # Тести для Monitor Dashboard (9000)
│   ├── test_monitor_dashboard.sh    # Головний тест Monitor Dashboard
│   └── results/                      # Результати тестування
│       └── test_results_YYYY-MM-DD_HH-MM-SS.txt
│
├── backend/                    # Тести для Backend API (3000)
├── mobile/                     # Тести для Mobile Apps
└── integration/                # Інтеграційні тести
```

## 🚀 Як Запускати Тести

### Monitor Dashboard Test

```bash
# Запустити тест Monitor Dashboard
./tests/monitor/test_monitor_dashboard.sh

# Результати зберігаються в:
tests/monitor/results/test_results_YYYY-MM-DD_HH-MM-SS.txt
```

## 📋 Що Перевіряє Monitor Dashboard Test

### ✅ TEST 1: Доступність Monitor Dashboard
- Порт 9000 активний
- HTTP відповідь працює
- HTML інтерфейс завантажується

### ✅ TEST 2: API Endpoints
- `GET /api/status` - статус всіх сервісів
- `GET /api/health` - перевірка здоров'я
- WebSocket (Socket.IO) підключення

### ✅ TEST 3: Log Файли
Перевіряє наявність 21 log файлу:
- `/tmp/backend.log`
- `/tmp/bot-master.log` ... `/tmp/bot-municipal.log`
- `/tmp/admin-panel.log`, `/tmp/city-hall.log`, `/tmp/staff-panel.log`
- `/tmp/dept-roads.log` ... `/tmp/dept-vandalism.log`
- `/tmp/expo-school.log`, `/tmp/expo-parent.log`, `/tmp/expo-client.log`
- `/tmp/monitor.log`

### ✅ TEST 4: Порти Всіх Сервісів
- Backend API: 3000
- Telegram Botи: 3001-3005
- Core Dashboards: 5173, 5174, 5176
- Departments: 5180-5187 (8 департаментів)
- Mobile Apps: 8081-8083 (3 Expo apps)

### ✅ TEST 5: Кнопки Категорій (HTML)
Перевіряє наявність кнопок:
- 🤖 Telegram Боти: Запустити/Зупинити/Показати/Інструкції
- 🖥️ Core Dashboards: Запустити/Зупинити/Показати/Інструкції
- 🏢 Департаменти: Запустити/Зупинити/Показати/Інструкції
- 📱 Mobile Apps: Запустити/Зупинити/Показати/Інструкції

### ✅ TEST 6: Інструкції Запуску (HTML)
Перевіряє наявність інструкцій для:
- Botи (npm run dev, npm run bot:*)
- Dashboards (cd + npm run dev)
- Departments (cd departments/* + npm run dev)
- Expo (npx expo start)

### ✅ TEST 7: CSS Стилі
Перевіряє наявність нових стилів:
- `.section-header-with-controls`
- `.category-btn`
- `.how-to-run`

### ✅ TEST 8: Database
- SQLite файл існує
- Таблиці створено
- Користувачі в базі

## 📊 Результати Тестування

### Формат Виводу

```
╔════════════════════════════════════════════════════════╗
║  🧪 TEST: Monitor Dashboard (Port 9000) - Full Validation
╚════════════════════════════════════════════════════════╝

📅 Дата: 2026-03-05 15:30:45
📍 Проект: /Users/apple/Desktop/GenTrust_Mobility_DE

╔════════════════════════════════════════════════════════╗
║  TEST 1: Доступність Monitor Dashboard
╚════════════════════════════════════════════════════════╝

→ Перевірка порту 9000...
✅ Monitor Dashboard (порт 9000): ✅ Активний

→ Перевірка HTTP відповіді...
✅ Monitor Dashboard відповідає на HTTP запити

...

╔════════════════════════════════════════════════════════╗
║  📊 ФІНАЛЬНІ РЕЗУЛЬТАТИ
╚════════════════════════════════════════════════════════╝

📈 Статистика тестування:
   Всього тестів: 47
   ✅ Пройдено: 45
   ❌ Провалено: 2

⚠️  УВАГА: ДЕЯКІ ТЕСТИ НЕ ПРОЙДЕНО

📄 Повний звіт збережено: tests/monitor/results/test_results_2026-03-05_15-30-45.txt
```

### Кольори Виводу

- 🟢 **Зелений** (`✅`) - Тест пройдено
- 🔴 **Червоний** (`❌`) - Тест провалено
- 🟡 **Жовтий** (`⚠️`) - Попередження
- 🔵 **Синій** (`ℹ️`) - Інформація

## 🔧 Створення Нових Тестів

### Шаблон Тесту

```bash
#!/bin/bash

################################################################################
# 🧪 TEST: [Назва Тесту]
# 
# 📋 ОПИС ТЕСТУВАННЯ:
#   [Опис що тестується]
#
# ✅ ЩО ПЕРЕВІРЯЄТЬСЯ:
#   1. [Перевірка 1]
#   2. [Перевірка 2]
#
# 🚀 ВИКОРИСТАННЯ:
#   ./tests/[category]/[test_name].sh
#
################################################################################

# 🎨 Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m'

# 📍 Змінні
PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
RESULTS_DIR="$PROJECT_DIR/tests/[category]/results"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
RESULT_FILE="$RESULTS_DIR/test_results_$TIMESTAMP.txt"

# 📊 Лічильники
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

mkdir -p "$RESULTS_DIR"

# 📝 Функції (див. вище)
log_result() { echo -e "$1" | tee -a "$RESULT_FILE"; }
print_header() { ... }
print_success() { ... }
print_error() { ... }

# 🧪 Тестування
print_header "🧪 TEST: [Назва]"
# ... ваші тести ...

# 📊 Фінальні результати
print_header "📊 ФІНАЛЬНІ РЕЗУЛЬТАТИ"
# ... статистика ...
```

## 📄 Приклади Використання

### Запустити всі тести Monitor Dashboard

```bash
./tests/monitor/test_monitor_dashboard.sh
```

### Переглянути останні результати

```bash
ls -lt tests/monitor/results/ | head -5
cat tests/monitor/results/test_results_2026-03-05_15-30-45.txt
```

### Відкрити папку з результатами

```bash
open tests/monitor/results/
```

## 🎯 Best Practices

1. **Кожен тест зберігає результати** - автоматичне збереження в `results/`
2. **Використовуй кольори** - зелений/червоний для статусу
3. **Додавай лічильники** - TOTAL/PASSED/FAILED
4. **Створюй timestamp** - унікальні імена файлів
5. **Документуй тести** - опис в шапці скрипта

## 📚 Додаткова Документація

- [Monitor Dashboard](../../monitor/README.md)
- [API Documentation](../../docs/API.md)
- [System Architecture](../../ARCHITECTURE.md)

---

**Last Updated:** 2026-03-05  
**Version:** v1.0.0  
**Maintained by:** GenTrust Mobility Team
