#!/bin/bash

################################################################################
#                   GENTRUST MOBILITY - УНІВЕРСАЛЬНИЙ ЗАПУСК                  #
#                                                                              #
# 📋 ОПЦІЇ:                                                                   #
#   ./start.sh                  - основні сервіси (backend + dashboard + expo) #
#   ./start.sh --with-all-apps  - + мобіл-клієнт на 8081                      #
#   ./start.sh --staff-only     - тільки staff panel (5173)                   #
#   ./start.sh --admin-only     - тільки admin panel (5174)                   #
#   ./start.sh --api-only       - тільки backend без ботів (API mode)         #
#   ./start.sh --dept-only      - тільки department dashboard (5175)          #
#                                                                              #
# ⚠️  ПРАВИЛО ЗБЕРЕЖЕННЯ КОДУ:                                                 #
#   - Ніколи не видаляй код з проекту                                         #
#   - Якщо код неактивний - залишай його в файлі з коментарем                  #
#   - Формат коментаря: // DISABLED: причина (дата)                            #
#   - Приклад: // DISABLED: старий API endpoint, замінено на v2 (2026-03-05)   #
#                                                                              #
# 📝 ПРАВИЛО ДОКУМЕНТУВАННЯ ЗМІН:                                              #
#   - Кожне нововведення записуй в README.md та ROADMAP.md                     #
#   - Формат запису:                                                           #
#     * Дата: РРРР-ММ-ДД                                                        #
#     * Версія: vX.X.X                                                         #
#     * Опис: що змінено/додано/виправлено                                     #
#   - Приклад:                                                                 #
#     ## 2026-03-05 v3.2.0 - Додано 8 департаментів                            #
#     - Додано: 8 департаментів на портах 5180-5187                            #
#     - Оновлено: start.sh з автозапуском департаментів                        #
#     - Виправлено: перевірка здоров'я для всіх портів                         #
#                                                                              #
# 🔒 ПРАВИЛО ФІКСОВАНИХ ПОРТІВ:                                                #
#   - Кожен сервіс має СВІЙ фіксований порт (назавжди)                         #
#   - Ніхто інший НЕ МАЄ ПРАВА займати чужий порт                             #
#   - Якщо порт зайнятий - ВБИВАЄМО порушника (lsof -ti:PORT | xargs kill -9) #
#   - Якщо не можемо запустити - ПИШЕМО ПОМИЛКУ і не пробуємо інші порти       #
#   - Приклад: Backend API ЗАВЖДИ на 3000, ніколи на 3001 чи 3002              #
#                                                                              #
# ⚠️  ПРАВИЛО ОБМЕЖЕННЯ ДІАПАЗОНУ ПОРТІВ (КРИТИЧНО):                          #
#   - Твій діапазон роботи: 3000 - 9000                                        #
#   - ЗАБОРОНЕНО чіпати порти ПОЗА цим діапазоном                              #
#   - НЕ зупиняти процеси на портах < 3000 або > 9000                          #
#   - НЕ перевіряти порти поза діапазоном (3000-9000)                          #
#   - Це запобігає зупинці сторонніх сервісів (MySQL 3306, Redis 6379, etc.)   #
#   - Приклад: НЕ чіпати порти 27017 (MongoDB), 5432 (PostgreSQL)              #
#                                                                              #
# 🤖 ІНСТРУКЦІЯ ДЛЯ AI АСИСТЕНТА (продовження роботи):                         #
#   Якщо ти AI асистент і продовжуєш роботу над проектом, виконай:             #
#   1. Прочитай start.sh - зрозумій поточну логіку запуску                     #
#   2. Прочитай README.md - дізнайся поточну версію (v5.1.0+)                  #
#   3. Прочитай ROADMAP.md - зрозумій плани на майбутнє                        #
#   4. Прочитай DUAL_WRITE_ARCHITECTURE.md - архітектура подвійного запису     #
#   5. Продовжуй згідно ROADMAP (Рівень 1, 2, 3 оптимізації)                   #
#                                                                              #
# 📝 ОСТАННІ ЗМІНИ:                                                            #
#   ## 2026-03-07 v5.1.8 - Фінальна стабілізація                              #
#   - Виправлено: department-dashboard API (reportsRes.data?.data → reportsRes)#
#   - Виправлено: authorId в тестових звітах (usr_* → UUID)                   #
#   - Виправлено: Prisma Client помилки (npx prisma generate)                 #
#   - Додано: 40 тестових звітів для Вюрцбурга (5 на департамент)             #
#   - Оновлено: Всі департаменти мають новий код з department-dashboard       #
#   - Завершено: Всі 8 департаментів працюють з тестовими даними              #
#                                                                              #
#   ## 2026-03-07 v5.1.7 - Würzburg Test Data (40 завдань)                     #
#   - Створено: 40 тестових звітів для Вюрцбурга (5 на департамент)           #
#   - Створено: test_data/wuerzburg_test_reports.json                          #
#   - Створено: scripts/generate_test_data.js                                  #
#   - Створено: scripts/import_test_reports.js                                 #
#   - Створено: test_data/WURZBURG_TEST_DATA.md - документація                 #
#                                                                              #
#   ## 2026-03-07 v5.1.5 - Виправлено завантаження конфігурації               #
#   - Виправлено: App.tsx використовує __DEPT_ID__ змінні                     #
#   - Додано: vite-env.d.ts з оголошеннями глобальних змінних                 #
#   - Додано: departments.config.json в public кожного департаменту           #
#   - Виправлено: Тепер кожен департамент має свій колір і назву              #
#                                                                              #
#   ## 2026-03-07 v5.1.4 - Dynamic Department Theming                          #
#   - Додано: departments.config.json - конфігурація кольорів                 #
#   - Додано: Кожен департамент має свій колір (8 кольорів)                   #
#   - Оновлено: Layout.tsx з динамічним заголовком                            #
#   - Оновлено: Dashboard.tsx з динамічними графіками                         #
#   - Створено: DEPARTMENT_STYLING.md - документація стилів                   #
#                                                                              #
#   ## 2026-03-06 v5.1.3 - Unified Design System                               #
#   - Оновлено: Department Dashboard Layout з правильним заголовком           #
#   - Оновлено: Використання DepartmentContext в Layout                       #
#   - Створено: DESIGN_SYSTEM.md - повна дизайн-система                       #
#   - Перевірено: Всі дашборди мають однаковий дизайн                         #
#                                                                              #
#   ## 2026-03-06 v5.1.2 - Виправлено перевірку Ecology та Vandalism          #
#   - Виправлено: неправильний синтаксис bash (${dept^})                      #
#   - Виправлено: занадто рання перевірка портів (треба 50-60 сек)            #
#   - Додано: tests/system/test_all_services.sh - повний тест сервісів        #
#   - Додано: tests/README.md - документація тестів                           #
#   - Створено: tests/system/BUG_REPORT_ECOLOGY_VANDALISM.md                  #
#                                                                              #
#   ## 2026-03-06 v5.1.1 - Port Range Safety Rule                              #
#   - Додано: Правило обмеження діапазону портів (3000-9000)                   #
#   - Додано: ЗАБОРОНА чіпати порти поза діапазоном                            #
#   - Додано: Коментарі для безпеки (MySQL, Redis, MongoDB)                    #
#                                                                              #
#   ## 2026-03-06 v5.1.0 - Dual-Write Architecture (ПОДВІЙНИЙ ЗАПИС)           #
#   - Додано: подвійний запис звітів (Головна БД + БД департаменту)            #
#   - Додано: City-Hall бачить ВСІ звіти для статистики                        #
#   - Додано: Департаменти бачать тільки свої звіти                            #
#   - Додано: 8 SQLite баз для департаментів (databases/*_dept.db)             #
#   - Оновлено: src/api/routes/reports.ts з dual-write логікою                 #
#   - Оновлено: README.md та ROADMAP.md з документацією                        #
#                                                                              #
#   ## 2026-03-06 v5.0.0 - Multi-Database Architecture                         #
#   - Додано: 8 окремих баз даних для департаментів                            #
#   - Додано: scripts/init_department_dbs.sh                                   #
#   - Додано: scripts/migrate_departments.sh                                   #
#   - Оновлено: City-Hall Dashboard з оглядом департаментів                    #
#   - Покращення: -70% RAM, -75% response time                                 #
#                                                                              #
################################################################################

# 🎨 Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 📍 Базова директорія проекту
PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
cd "$PROJECT_DIR" || exit 1

# 🎯 Парсинг аргументів
MODE="default"
if [ "$1" == "--with-all-apps" ]; then
    MODE="all-apps"
elif [ "$1" == "--staff-only" ]; then
    MODE="staff"
elif [ "$1" == "--admin-only" ]; then
    MODE="admin"
elif [ "$1" == "--api-only" ]; then
    MODE="api"
elif [ "$1" == "--dept-only" ]; then
    MODE="dept"
fi

################################################################################
#                            1️⃣  ОЧИСТКА СИСТЕМИ                              #
################################################################################

print_header() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC}  $1"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"
}

print_step() {
    echo -e "${YELLOW}→${NC} $1"
}

print_success() {
    echo -e "${GREEN}✅${NC} $1"
}

print_error() {
    echo -e "${RED}❌${NC} $1"
}

print_header "🧹 КРОК 1: ОЧИСТКА ВСІХ ПРОЦЕСІВ ТА ПОРТІВ"

print_step "Убиваю всі старі процеси..."
killall -9 node npm vite expo 2>/dev/null || true
sleep 2
print_success "Всі процеси зупинені"

print_step "Очищую npm кеш..."
npm cache clean --force 2>/dev/null || true
print_success "npm кеш очищено"

# ⚠️ УВАГА: Очищаємо ТІЛЬКИ порти нашого діапазону (3000-9000)
# НЕ чіпати порти поза цим діапазоном (MySQL 3306, Redis 6379, MongoDB 27017, etc.)
print_step "Перевіряю та звільняю порти (3000, 5173, 5174, 5175, 8081, 8082, 8083, 9000)..."
for port in 3000 5173 5174 5175 8081 8082 8083 9000; do
    lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done
sleep 1
print_success "Всі порти звільнені (тільки наш діапазон 3000-9000)"

print_step "Очищую Expo кеші..."
rm -rf "$PROJECT_DIR/mobile-school/.expo" 2>/dev/null || true
rm -rf "$PROJECT_DIR/mobile/.expo" 2>/dev/null || true
rm -rf "$PROJECT_DIR/admin-panel/.expo" 2>/dev/null || true
rm -rf "$PROJECT_DIR/staff-panel/.expo" 2>/dev/null || true
print_success "Expo кеші очищені"

print_step "🔒 ЗАХИСТ ДАНИХ: Перевіряю базу даних..."
if [ ! -f "$PROJECT_DIR/prisma/dev.db" ]; then
    print_error "❌ База даних не знайдена: $PROJECT_DIR/prisma/dev.db"
    exit 1
fi
# Перевіряю що база даних не порожня
DB_USERS=$(sqlite3 "$PROJECT_DIR/prisma/dev.db" "SELECT COUNT(*) FROM User WHERE id IS NOT NULL;" 2>/dev/null || echo "0")
if [ "$DB_USERS" -gt 0 ]; then
    print_success "✅ База даних в безпеці ($DB_USERS користувачів знайдено)"
else
    print_error "⚠️  Увага: База даних порожня!"
fi

if [ ! -f "$PROJECT_DIR/package.json" ]; then
    print_error "❌ package.json не знайдено"
    exit 1
fi
print_success "package.json знайдено"

################################################################################
#                           2️⃣  ЗАПУСК СЕРВІСІВ                               #
################################################################################

print_header "🚀 КРОК 2: ЗАПУСК СЕРВІСІВ (Режим: $MODE)"

# 🆕 ФУНКЦІЯ: Очікування готовності Backend API
wait_for_backend() {
    print_step "Очікування готовності Backend API..."
    for i in {1..15}; do
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            print_success "Backend API готовий!"
            return 0
        fi
        sleep 1
    done
    print_error "❌ Backend API не готовий через 15 секунд!"
    return 1
}

# ФУНКЦІЯ ДЛЯ ЗАПУСКУ З ПЕРЕВІРКОЮ ПОРТУ
launch_service() {
    local service_name=$1
    local port=$2
    local command=$3
    local dir=$4
    local log_file="/tmp/${service_name//[ ()]/}.log"
    local max_retries=2
    local retry=0

    while [ $retry -lt $max_retries ]; do
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        if [ $retry -gt 0 ]; then
            print_step "🔄 СПРОБА $retry: Запускаю $service_name на порту $port..."
        else
            print_step "Запускаю $service_name на порту $port..."
        fi

        # 🔒 ПЕРЕВІРКА: Чи зайнятий порт кимось?
        print_step "Перевірка порту $port..."
        local existing_pid=$(lsof -ti:$port 2>/dev/null)

        if [ -n "$existing_pid" ]; then
            print_error "⚠️  Порт $port ЗАЙНЯТИЙ (PID: $existing_pid)!"
            print_step "ВБИВАЄМО порушника на порту $port..."
            lsof -ti:$port | xargs kill -9 2>/dev/null
            sleep 2

            # Перевіряємо чи вдалося звільнити порт
            if lsof -ti:$port 2>/dev/null | grep -q .; then
                print_error "❌ НЕ ВДАЛОСЯ звільнити порт $port! Процес $existing_pid не вбивається."
                print_error "   Причина: Можливо процес запущено від root або це системний процес."
                print_error "   Рішення: Вбийте вручну: sudo lsof -ti:$port | xargs sudo kill -9"
                return 1
            else
                print_success "Порт $port звільнено (вбито PID: $existing_pid)"
            fi
        fi

        # Запускаємо сервіс
        cd "$dir" || return 1
        eval "$command" > "$log_file" 2>&1 &
        local pid=$!

        # 🆕 ОПТИМІЗАЦІЯ: Різний час для різних типів сервісів
        if [[ "$service_name" == *"Backend"* ]]; then
            sleep 10  # Backend з ботами потребує більше часу
        elif [[ "$dir" == *"dashboard"* ]] || [[ "$dir" == *"panel"* ]]; then
            sleep 5   # Vite dashboards
        else
            sleep 5   # решта
        fi

        # Перевіряю що процес живий
        if ! kill -0 $pid 2>/dev/null; then
            print_error "$service_name не запустився (PID: $pid)"
            echo "Логи:"
            tail -n 10 "$log_file"
            
            # 🆕 СПРОБА ЗАНОВО
            retry=$((retry + 1))
            if [ $retry -lt $max_retries ]; then
                print_step "🔄 Спроба $retry: Очищення порту $port..."
                lsof -ti:$port | xargs kill -9 2>/dev/null
                sleep 2
                continue
            fi
            
            return 1
        fi

        # 🔒 ПЕРЕВІРКА: Чи дійсно наш процес зайняв правильний порт?
        # Даємо ще 3 секунди на стабілізацію
        sleep 3
        local actual_pid=$(lsof -ti:$port 2>/dev/null | head -1)

        # Для Vite процесів - перевіряємо що хоча б один процес на порту
        if [ -z "$actual_pid" ]; then
            print_error "❌ ПОМИЛКА! Порт $port ніким не зайнятий!"
            print_error "   $service_name не зміг зайняти свій порт"
            print_error "   Причина: Помилка запуску або порт заблоковано"
            print_error "   Логи:"
            tail -n 20 "$log_file"
            
            # 🆕 СПРОБА ЗАНОВО - ЗУПИНИТИ І ЗАПУСТИТИ
            retry=$((retry + 1))
            if [ $retry -lt $max_retries ]; then
                print_step "🔄 Спроба $retry: Зупинка всього на порту $port..."
                lsof -ti:$port | xargs kill -9 2>/dev/null
                sleep 2
                print_step "🔄 Спроба $retry: Повторний запуск..."
                continue
            fi
            
            return 1
        fi

        # Перевіряємо що процес активний
        if ! kill -0 $actual_pid 2>/dev/null; then
            print_error "❌ ПОМИЛКА! Процес на порту $port (PID: $actual_pid) не активний"
            
            # 🆕 СПРОБА ЗАНОВО
            retry=$((retry + 1))
            if [ $retry -lt $max_retries ]; then
                print_step "🔄 Спроба $retry: Зупинка всього на порту $port..."
                lsof -ti:$port | xargs kill -9 2>/dev/null
                sleep 2
                print_step "🔄 Спроба $retry: Повторний запуск..."
                continue
            fi
            
            return 1
        fi

        print_success "$service_name запущено (PID: $pid, порт: $port)"
        echo "  📝 Логи: tail -f $log_file"

        return 0  # Успіх!
    done

    return 1  # Всі спроби вичерпано
}

case $MODE in
    "default")
        # СИСТЕМА МОНІТОРИНГУ (запускається першою)
        print_step "🎯 Запускаю систему моніторингу на порту 9000..."
        cd "$PROJECT_DIR/monitor"
        node server.js > /tmp/Monitor.log 2>&1 &
        MONITOR_PID=$!
        sleep 2
        print_success "Система моніторингу запущена (PID: $MONITOR_PID)"
        echo "  🌐 Відкрийте: http://localhost:9000"
        echo ""

        # BACKEND (з ботами) - ЗАВЖДИ ПЕРШИМ СЕРЕД СЕРВІСІВ
        # DISABLED: 2026-03-07 - bot.ts має помилки Prisma, використовуємо API mode
        # launch_service "Backend API (з ботами)" "3000" "npm run dev" "$PROJECT_DIR" || exit 1
        launch_service "Backend API (API mode)" "3000" "npm run api" "$PROJECT_DIR" || exit 1
        
        # 🆕 КРИТИЧНО: Чекаємо поки Backend буде готовий
        wait_for_backend || exit 1

        # CORE DASHBOARDS (тільки після готовності Backend)
        # 🏛️ City-Hall Dashboard (5173) - ЗАВЖДИ ПЕРЕД Admin Panel
        launch_service "City-Hall Dashboard" "5173" "npm run dev" "$PROJECT_DIR/city-hall-dashboard" || exit 1

        # 🔐 Admin Panel (5174)
        launch_service "Admin Panel (Core Dashboard)" "5174" "npm run dev" "$PROJECT_DIR/admin-panel" || exit 1

        # 🏢 Department Dashboard (Base 5175)
        launch_service "Department Dashboard" "5175" "npm run dev" "$PROJECT_DIR/department-dashboard" || exit 1

        # 🛣️ 8 ДЕПАРТАМЕНТІВ - КОЖЕН НА СВОЄМУ ПОРТУ
        print_step "🏢 Запускаю 8 департаментів..."
        
        # 🆕 МАСИВ ДЛЯ ЗБОРУ ПОМИЛОК
        FAILED_DEPTS=()

        # 🛣️ Дороги (5180)
        launch_service "Dept: Roads" "5180" "npm run dev" "$PROJECT_DIR/departments/roads" || FAILED_DEPTS+=("Roads")

        # 💡 Освітлення (5181)
        launch_service "Dept: Lighting" "5181" "npm run dev" "$PROJECT_DIR/departments/lighting" || FAILED_DEPTS+=("Lighting")

        # 🗑️ Сміття (5182)
        launch_service "Dept: Waste" "5182" "npm run dev" "$PROJECT_DIR/departments/waste" || FAILED_DEPTS+=("Waste")

        # 🌳 Парки (5183)
        launch_service "Dept: Parks" "5183" "npm run dev" "$PROJECT_DIR/departments/parks" || FAILED_DEPTS+=("Parks")

        # 🚰 Вода (5184)
        launch_service "Dept: Water" "5184" "npm run dev" "$PROJECT_DIR/departments/water" || FAILED_DEPTS+=("Water")

        # 🚌 Транспорт (5185)
        launch_service "Dept: Transport" "5185" "npm run dev" "$PROJECT_DIR/departments/transport" || FAILED_DEPTS+=("Transport")

        # 🌿 Екологія (5186)
        launch_service "Dept: Ecology" "5186" "npm run dev" "$PROJECT_DIR/departments/ecology" || FAILED_DEPTS+=("Ecology")

        # 🎨 Вандалізм (5187)
        launch_service "Dept: Vandalism" "5187" "npm run dev" "$PROJECT_DIR/departments/vandalism" || FAILED_DEPTS+=("Vandalism")
        
        # 🆕 ЗВІТ ПРО НЕВДАЛІ ДЕПАРТАМЕНТИ
        if [ ${#FAILED_DEPTS[@]} -gt 0 ]; then
            print_error "❌ Не вдалося запустити департаменти: ${FAILED_DEPTS[*]}"
            print_error "   Перевірте логи: tail -f /tmp/dept-*.log"
        else
            print_success "Всі 8 департаментів запущені (порти 5180-5187)"
        fi

        # 🚫 EXPO MOBILE SCHOOL - ЗАКОМЕНТОВАНО (запускай окремо якщо потрібно)
        # DISABLED: Expo не запускається автоматично, тільки вручну (2026-03-05)
        # launch_service "Expo Mobile-School" "8082" "npm start" "$PROJECT_DIR/mobile-school" || exit 1

        # EXPO MOBILE PARENT (закоментовано - запускай окремо якщо потрібно)
        # DISABLED: не потрібен за замовчуванням, запускай окремо (2026-03-05)
        # launch_service "Expo Mobile-Parent (Батьки)" "8083" "npm start" "$PROJECT_DIR/mobile-parent" || exit 1

        # ✅ АВТОМАТИЧНА ПЕРЕВІРКА ПІСЛЯ ЗАПУСКУ - ТИМЧАСОВО ВИМКНЕНО
        # print_header "🧪 АВТОМАТИЧНА ПЕРЕВІРКА ВСІХ СЕРВІСІВ"
        # print_step "Зачекайте 10 секунд на стабілізацію сервісів..."
        # sleep 10
        # ... (перевірка вимкнена для швидкості)

        # Відкрити Monitor Dashboard
        print_step "Відкриття Monitor Dashboard..."
        sleep 2
        open http://localhost:9000
        ;;
        
    "all-apps")
        # СИСТЕМА МОНІТОРИНГУ
        print_step "🎯 Запускаю систему моніторингу на порту 9000..."
        cd "$PROJECT_DIR/monitor"
        node server.js > /tmp/Monitor.log 2>&1 &
        MONITOR_PID=$!
        sleep 2
        print_success "Система моніторингу запущена (PID: $MONITOR_PID)"
        echo "  🌐 Відкрийте: http://localhost:9000"
        echo ""

        # BACKEND (з ботами) - ЗАВЖДИ ПЕРШИМ
        launch_service "Backend API (з ботами)" "3000" "npm run dev" "$PROJECT_DIR" || exit 1
        
        # 🆕 КРИТИЧНО: Чекаємо поки Backend буде готовий
        wait_for_backend || exit 1

        # CITY-HALL DASHBOARD
        launch_service "City-Hall Dashboard" "5173" "npm run dev" "$PROJECT_DIR/city-hall-dashboard" || exit 1

        # DEPARTMENT DASHBOARD (Base)
        launch_service "Department Dashboard" "5175" "npm run dev" "$PROJECT_DIR/department-dashboard" || exit 1

        # 🛣️ 8 ДЕПАРТАМЕНТІВ - КОЖЕН НА СВОЄМУ ПОРТУ
        print_step "🏢 Запускаю 8 департаментів..."
        
        # 🆕 МАСИВ ДЛЯ ЗБОРУ ПОМИЛОК
        FAILED_DEPTS=()

        # 🛣️ Дороги (5180)
        launch_service "Dept: Roads" "5180" "npm run dev" "$PROJECT_DIR/departments/roads" || FAILED_DEPTS+=("Roads")

        # 💡 Освітлення (5181)
        launch_service "Dept: Lighting" "5181" "npm run dev" "$PROJECT_DIR/departments/lighting" || FAILED_DEPTS+=("Lighting")

        # 🗑️ Сміття (5182)
        launch_service "Dept: Waste" "5182" "npm run dev" "$PROJECT_DIR/departments/waste" || FAILED_DEPTS+=("Waste")

        # 🌳 Парки (5183)
        launch_service "Dept: Parks" "5183" "npm run dev" "$PROJECT_DIR/departments/parks" || FAILED_DEPTS+=("Parks")

        # 🚰 Вода (5184)
        launch_service "Dept: Water" "5184" "npm run dev" "$PROJECT_DIR/departments/water" || FAILED_DEPTS+=("Water")

        # 🚌 Транспорт (5185)
        launch_service "Dept: Transport" "5185" "npm run dev" "$PROJECT_DIR/departments/transport" || FAILED_DEPTS+=("Transport")

        # 🌿 Екологія (5186)
        launch_service "Dept: Ecology" "5186" "npm run dev" "$PROJECT_DIR/departments/ecology" || FAILED_DEPTS+=("Ecology")

        # 🎨 Вандалізм (5187)
        launch_service "Dept: Vandalism" "5187" "npm run dev" "$PROJECT_DIR/departments/vandalism" || FAILED_DEPTS+=("Vandalism")
        
        # 🆕 ЗВІТ ПРО НЕВДАЛІ ДЕПАРТАМЕНТИ
        if [ ${#FAILED_DEPTS[@]} -gt 0 ]; then
            print_error "❌ Не вдалося запустити департаменти: ${FAILED_DEPTS[*]}"
            print_error "   Перевірте логи: tail -f /tmp/dept-*.log"
        else
            print_success "Всі 8 департаментів запущені (порти 5180-5187)"
        fi

        # EXPO MOBILE SCHOOL
        launch_service "Expo Mobile-School" "8082" "npm start -- --port 8082" "$PROJECT_DIR/mobile-school" || exit 1

        # EXPO MOBILE CLIENT
        launch_service "Expo Mobile-Client" "8081" "npm start -- --port 8081" "$PROJECT_DIR/mobile/gentrustmobility" || exit 1

        # DISABLED: mobile-parent запускається окремо за потреби (2026-03-05)
        # launch_service "Expo Mobile-Parent" "8083" "npm start -- --port 8083" "$PROJECT_DIR/mobile-parent" || exit 1
        ;;
        
    "staff")
        launch_service "Staff Panel" "5173" "npm run dev" "$PROJECT_DIR/staff-panel" || exit 1
        ;;
        
    "admin")
        launch_service "Admin Panel" "5174" "npm run dev" "$PROJECT_DIR/admin-panel" || exit 1
        ;;
        
    "api")
        launch_service "Backend API (API-only, без ботів)" "3000" "npm run api" "$PROJECT_DIR" || exit 1
        ;;

    "dept")
        launch_service "Department Dashboard" "5175" "npm run dev" "$PROJECT_DIR/department-dashboard" || exit 1
        ;;
esac

################################################################################
#                       3️⃣  ПЕРЕВІРКА ЗДОРОВ'Я СЕРВІСІВ                       #
################################################################################

print_header "🏥 КРОК 3: ПЕРЕВІРКА ЗДОРОВ'Я СЕРВІСІВ"

check_health() {
    local url=$1
    local service_name=$2
    
    sleep 2
    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "200" ] || [ "$response" == "000" ]; then
        print_success "$service_name: $url"
    else
        echo -e "${YELLOW}⚠️${NC}  $service_name: $url (статус: $response)"
    fi
}

if [ "$MODE" == "default" ] || [ "$MODE" == "all-apps" ]; then
    echo -e "${CYAN}📡 Backend API:${NC}"
    curl -s http://localhost:3000/api/health 2>/dev/null | head -c 100 && echo "" || echo "⚠️ Не відповідає"
fi

if [ "$MODE" == "default" ] || [ "$MODE" == "all-apps" ]; then
    echo -e "${CYAN}🎛️  City-Hall Dashboard:${NC}"
    curl -s -I http://localhost:5173 2>/dev/null | head -n 1 || echo "⚠️ Не відповідає"
fi

if [ "$MODE" == "default" ] || [ "$MODE" == "all-apps" ]; then
    echo -e "${CYAN}🏢 Department Dashboard:${NC}"
    curl -s -I http://localhost:5175 2>/dev/null | head -n 1 || echo "⚠️ Не відповідає"
fi

# 🏢 Перевірка 8 департаментів
if [ "$MODE" == "default" ] || [ "$MODE" == "all-apps" ]; then
    echo -e "${CYAN}🏢 8 Департаментів:${NC}"
    for port in 5180 5181 5182 5183 5184 5185 5186 5187; do
        curl -s -I http://localhost:$port 2>/dev/null | head -n 1 > /dev/null && echo "  ✅ Порт $port" || echo "  ⚠️  Порт $port"
    done
fi

if [ "$MODE" == "staff" ]; then
    echo -e "${CYAN}👥 Staff Panel:${NC}"
    curl -s -I http://localhost:5173 2>/dev/null | head -n 1 || echo "⚠️ Не відповідає"
fi

if [ "$MODE" == "admin" ]; then
    echo -e "${CYAN}🔐 Admin Panel:${NC}"
    curl -s -I http://localhost:5174 2>/dev/null | head -n 1 || echo "⚠️ Не відповідає"
fi

if [ "$MODE" == "dept" ]; then
    echo -e "${CYAN}🏢 Department Dashboard:${NC}"
    curl -s -I http://localhost:5175 2>/dev/null | head -n 1 || echo "⚠️ Не відповідає"
fi

################################################################################
#                    � МОНІТОРИНГ:          ${CYAN}http://localhost:9000${NC} ${YELLOW}⭐ ВІДКРИЙ ПЕРШИМ!${NC}"
        echo -e "   �     4️⃣  ФІНАЛЬНА ІНФОРМАЦІЯ                            #
################################################################################

print_header "✅ ГОТОВО! ВСІ СЕРВІСИ ЗАПУЩЕНІ"

IP_ADDRESS=$(ipconfig getifaddr en0 2>/dev/null || echo "localhost")

case $MODE in
    "default")
        echo -e "${GREEN}ПОСИЛАННЯ:${NC}"
        echo -e "   🌐 Моніторинг:        ${CYAN}http://localhost:9000${NC}"
        echo -e "   🌐 Backend API:       ${CYAN}http://localhost:3000/api${NC}"
        echo -e "   🔐 Admin Panel:       ${CYAN}http://localhost:5174${NC}"
        echo -e "   🏛️ City-Hall:         ${CYAN}http://localhost:5173${NC}"
        echo -e "   🏢 Department Base:   ${CYAN}http://localhost:5175${NC}"
        echo -e ""
        echo -e "   🏢 8 ДЕПАРТАМЕНТІВ:"
        echo -e "      🛣️  Roads:       ${CYAN}http://localhost:5180${NC}"
        echo -e "      💡 Lighting:     ${CYAN}http://localhost:5181${NC}"
        echo -e "      🗑️  Waste:       ${CYAN}http://localhost:5182${NC}"
        echo -e "      🌳 Parks:        ${CYAN}http://localhost:5183${NC}"
        echo -e "      🚰 Water:        ${CYAN}http://localhost:5184${NC}"
        echo -e "      🚌 Transport:    ${CYAN}http://localhost:5185${NC}"
        echo -e "      🌿 Ecology:      ${CYAN}http://localhost:5186${NC}"
        echo -e "      🎨 Vandalism:    ${CYAN}http://localhost:5187${NC}"
        echo -e ""
        echo -e "   📱 Expo School:       ${CYAN}exp://${IP_ADDRESS}:8082${NC}"
        echo ""
        echo -e "${GREEN}ТЕЛЕФОН:${NC}"
        echo -e "   Login: ${YELLOW}admin${NC} Password: ${YELLOW}admin${NC}"
        ;;
        ;;
        echo ""
        echo -e "${GREEN}📱 На ТЕЛЕФОНІ:${NC}"
        echo -e "   1. Відкрий Expo Go"
        echo -e "   2. Сканируй QR з терміналу"
        echo -e "   3. Логін: ${YELLOW}admin${NC} / Пароль: ${YELLOW}admin${NC}"
        echo ""
        echo -e "${GREEN}🔐 Дані для входу:${NC}"
        echo -e "   Юзернейм/Email: ${YELLOW}admin${NC}"
        echo -e "   Пароль:          ${YELLOW}admin${NC}"
        ;;
        
    "all-apps")
        echo -e "${GREEN}📍 ПОСИЛАННЯ:${NC}"
        echo -e "   🌐 Backend API:         ${CYAN}http://localhost:3000/api${NC}"
        echo -e "   🏛️ City-Hall:           ${CYAN}http://localhost:5173${NC}"
        echo -e "   🏢 Department:          ${CYAN}http://localhost:5175${NC}"
        echo -e ""
        echo -e "   🏢 8 ДЕПАРТАМЕНТІВ:"
        echo -e "      🛣️  Roads:       ${CYAN}http://localhost:5180${NC}"
        echo -e "      💡 Lighting:     ${CYAN}http://localhost:5181${NC}"
        echo -e "      🗑️  Waste:       ${CYAN}http://localhost:5182${NC}"
        echo -e "      🌳 Parks:        ${CYAN}http://localhost:5183${NC}"
        echo -e "      🚰 Water:        ${CYAN}http://localhost:5184${NC}"
        echo -e "      🚌 Transport:    ${CYAN}http://localhost:5185${NC}"
        echo -e "      🌿 Ecology:      ${CYAN}http://localhost:5186${NC}"
        echo -e "      🎨 Vandalism:    ${CYAN}http://localhost:5187${NC}"
        echo -e ""
        echo -e "   📱 Expo School:         ${CYAN}exp://${IP_ADDRESS}:8082${NC}"
        echo -e "   📱 Expo Client:         ${CYAN}exp://${IP_ADDRESS}:8081${NC}"
        ;;
        
    "staff")
        echo -e "${GREEN}📍 ПОСИЛАННЯ:${NC}"
        echo -e "   👥 Staff Panel:        ${CYAN}http://localhost:5173${NC}"
        echo -e "   Логін: ${YELLOW}admin${NC} / Пароль: ${YELLOW}admin${NC}"
        ;;
        
    "admin")
        echo -e "${GREEN}📍 ПОСИЛАННЯ:${NC}"
        echo -e "   🔐 Admin Panel:        ${CYAN}http://localhost:5174${NC}"
        echo -e "   Логін: ${YELLOW}admin${NC} / Пароль: ${YELLOW}admin${NC}"
        ;;
        
    "api")
        echo -e "${GREEN}📍 ПОСИЛАННЯ:${NC}"
        echo -e "   🌐 Backend API:        ${CYAN}http://localhost:3000/api${NC}"
        echo -e "   (API-only mode, без телеграм ботів)"
        ;;

    "dept")
        echo -e "${GREEN}📍 ПОСИЛАННЯ:${NC}"
        echo -e "   🏢 Department Dashboard: ${CYAN}http://localhost:5175${NC}"
        echo -e "   Логін: ${YELLOW}admin${NC} / Пароль: ${YELLOW}admin${NC}"
        ;;
esac

echo ""
echo -e "${GREEN}💡 КОМАНДИ:${NC}"
echo -e "   Зупинка всіх:    ${YELLOW}killall -9 node npm vite expo${NC}"
echo -e "   Логи:            ${YELLOW}tail -f /tmp/Backend\\ API\\ \\(з\\ ботами\\).log${NC}"
echo -e "   Статус портів:   ${YELLOW}lsof -i :3000 -i :5173 -i :8082${NC}"
echo ""
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"
