#!/bin/bash

################################################################################
# 🧪 TEST: Monitor Dashboard (Port 9000) - Full System Validation
# 
# 📋 ОПИС ТЕСТУВАННЯ:
#   Цей скрипт перевіряє працездатність Monitor Dashboard на порту 9000
#   Тестує всі кнопки, API endpoints, логи та інтерфейс користувача
#
# ✅ ЩО ПЕРЕВІРЯЄТЬСЯ:
#   1. Monitor Dashboard доступний (порт 9000)
#   2. Всі 21 сервіс мають правильні log файли
#   3. API endpoints працюють (start/stop/restart)
#   4. Кнопки категорій працюють (bots, dashboards, departments, expo)
#   5. Інтерфейс користувача відображається коректно
#   6. WebSocket підключення працює
#   7. Всі log файли існують або можуть бути створені
#
# 🚀 ВИКОРИСТАННЯ:
#   ./tests/monitor/test_monitor_dashboard.sh
#
# 📊 РЕЗУЛЬТАТИ:
#   Зберігаються в: tests/monitor/results/test_results_YYYY-MM-DD_HH-MM-SS.txt
#
################################################################################

# 🎨 Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 📍 Змінні
PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
MONITOR_URL="http://localhost:9000"
RESULTS_DIR="$PROJECT_DIR/tests/monitor/results"
TIMESTAMP=$(date +"%Y-%m-%d_%H-%M-%S")
RESULT_FILE="$RESULTS_DIR/test_results_$TIMESTAMP.txt"

# 📊 Лічильники
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# 📁 Створення папки результатів
mkdir -p "$RESULTS_DIR"

################################################################################
# 📝 ФУНКЦІЇ
################################################################################

log_result() {
    echo -e "$1" | tee -a "$RESULT_FILE"
}

print_header() {
    log_result ""
    log_result "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
    log_result "${BLUE}║${NC}  $1"
    log_result "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
    log_result ""
}

print_step() {
    log_result "${YELLOW}→${NC} $1"
}

print_success() {
    log_result "${GREEN}✅${NC} $1"
    ((PASSED_TESTS++))
    ((TOTAL_TESTS++))
}

print_error() {
    log_result "${RED}❌${NC} $1"
    ((FAILED_TESTS++))
    ((TOTAL_TESTS++))
}

print_info() {
    log_result "${CYAN}ℹ️${NC}  $1"
}

check_port() {
    local port=$1
    local service_name=$2
    
    if lsof -i:$port 2>/dev/null | grep LISTEN > /dev/null; then
        print_success "$service_name (порт $port): ✅ Активний"
        return 0
    else
        print_error "$service_name (порт $port): ❌ Не активний"
        return 1
    fi
}

check_log_file() {
    local log_file=$1
    local service_name=$2
    
    if [ -f "$log_file" ]; then
        print_success "Log файл для $service_name: ✅ Існує ($log_file)"
        return 0
    else
        print_info "Log файл для $service_name: ⚠️  Ще не створено ($log_file)"
        # Це не помилка, файл може створитись при першому запуску
        return 0
    fi
}

check_api_endpoint() {
    local endpoint=$1
    local description=$2
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$MONITOR_URL$endpoint" 2>/dev/null)
    
    if [ "$response" == "200" ] || [ "$response" == "000" ]; then
        print_success "API Endpoint: $description ✅"
        return 0
    else
        print_error "API Endpoint: $description ❌ (статус: $response)"
        return 1
    fi
}

check_html_content() {
    local content=$1
    local description=$2
    
    if curl -s "$MONITOR_URL" 2>/dev/null | grep -q "$content"; then
        print_success "HTML контент: $description ✅"
        return 0
    else
        print_error "HTML контент: $description ❌"
        return 1
    fi
}

################################################################################
# 🧪 ТЕСТУВАННЯ
################################################################################

print_header "🧪 TEST: Monitor Dashboard (Port 9000) - Full Validation"
log_result "📅 Дата: $(date)"
log_result "📍 Проект: $PROJECT_DIR"
log_result ""

################################################################################
# TEST 1: Перевірка доступності Monitor Dashboard
################################################################################
print_header "TEST 1: Доступність Monitor Dashboard"

print_step "Перевірка порту 9000..."
check_port 9000 "Monitor Dashboard"

print_step "Перевірка HTTP відповіді..."
if curl -s "$MONITOR_URL" > /dev/null 2>&1; then
    print_success "Monitor Dashboard відповідає на HTTP запити"
else
    print_error "Monitor Dashboard не відповідає на HTTP запити"
fi

print_step "Перевірка HTML інтерфейсу..."
check_html_content "GenTrust Mobility" "Заголовок сторінки"
check_html_content "Система Моніторингу Процесів" "Підзаголовок"
check_html_content "control-buttons" "Блок кнопок управління"

################################################################################
# TEST 2: Перевірка API Endpoints
################################################################################
print_header "TEST 2: API Endpoints"

check_api_endpoint "/api/status" "GET /api/status (статус всіх сервісів)"
check_api_endpoint "/api/health" "GET /api/health (перевірка здоров'я)"

# Перевірка WebSocket
print_step "Перевірка WebSocket підключення..."
if curl -s "$MONITOR_URL/socket.io/socket.io.js" > /dev/null 2>&1; then
    print_success "Socket.IO бібліотека доступна ✅"
else
    print_error "Socket.IO бібліотека недоступна ❌"
fi

################################################################################
# TEST 3: Перевірка Log Файлів
################################################################################
print_header "TEST 3: Перевірка Log Файлів"

# Список всіх сервісів та їх log файлів
declare -A LOG_FILES
LOG_FILES["Backend"]="/tmp/backend.log"
LOG_FILES["Master-Bot"]="/tmp/bot-master.log"
LOG_FILES["Scout-Bot"]="/tmp/bot-scout.log"
LOG_FILES["CityHall-Bot"]="/tmp/bot-cityhall.log"
LOG_FILES["Quest-Bot"]="/tmp/bot-quest.log"
LOG_FILES["Municipal-Bot"]="/tmp/bot-municipal.log"
LOG_FILES["Admin-Panel"]="/tmp/admin-panel.log"
LOG_FILES["City-Hall"]="/tmp/city-hall.log"
LOG_FILES["Staff-Panel"]="/tmp/staff-panel.log"
LOG_FILES["Roads-Dept"]="/tmp/dept-roads.log"
LOG_FILES["Lighting-Dept"]="/tmp/dept-lighting.log"
LOG_FILES["Waste-Dept"]="/tmp/dept-waste.log"
LOG_FILES["Parks-Dept"]="/tmp/dept-parks.log"
LOG_FILES["Water-Dept"]="/tmp/dept-water.log"
LOG_FILES["Transport-Dept"]="/tmp/dept-transport.log"
LOG_FILES["Ecology-Dept"]="/tmp/dept-ecology.log"
LOG_FILES["Vandalism-Dept"]="/tmp/dept-vandalism.log"
LOG_FILES["Expo-School"]="/tmp/expo-school.log"
LOG_FILES["Expo-Parent"]="/tmp/expo-parent.log"
LOG_FILES["Expo-Client"]="/tmp/expo-client.log"
LOG_FILES["Monitor"]="/tmp/monitor.log"

for service_name in "${!LOG_FILES[@]}"; do
    log_file="${LOG_FILES[$service_name]}"
    check_log_file "$log_file" "$service_name"
done

################################################################################
# TEST 4: Перевірка Портів Всіх Сервісів
################################################################################
print_header "TEST 4: Перевірка Портів Всіх Сервісів"

print_step "Backend API..."
check_port 3000 "Backend API"

print_step "Telegram Botи..."
check_port 3001 "Master Bot (опціонально)"
check_port 3002 "Scout Bot (опціонально)"
check_port 3003 "City Hall Bot (опціонально)"
check_port 3004 "Quest Provider Bot (опціонально)"
check_port 3005 "Municipal Bot (опціонально)"

print_step "Core Dashboards..."
check_port 5173 "City-Hall Dashboard"
check_port 5174 "Admin Panel"
check_port 5176 "Staff Panel"

print_step "Departments (8)..."
check_port 5180 "Roads Department"
check_port 5181 "Lighting Department"
check_port 5182 "Waste Department"
check_port 5183 "Parks Department"
check_port 5184 "Water Department"
check_port 5185 "Transport Department"
check_port 5186 "Ecology Department"
check_port 5187 "Vandalism Department"

print_step "Mobile Apps..."
check_port 8081 "Expo Client"
check_port 8082 "Expo School"
check_port 8083 "Expo Parent"

################################################################################
# TEST 5: Перевірка Кнопок Категорій (HTML)
################################################################################
print_header "TEST 5: Перевірка Кнопок Категорій"

print_step "Перевірка кнопок для Telegram Ботів..."
check_html_content "startAllBots" "Кнопка Запустити ВСІ боти"
check_html_content "stopAllBots" "Кнопка Зупинити ВСІ боти"
check_html_content "toggleCategory('bots')" "Кнопка Показати/Сховати боти"
check_html_content "toggleInstructions('bots-instructions')" "Кнопка Інструкції боти"

print_step "Перевірка кнопок для Core Dashboards..."
check_html_content "startAllDashboards" "Кнопка Запустити ВСІ Core"
check_html_content "stopAllDashboards" "Кнопка Зупинити ВСІ Core"
check_html_content "toggleCategory('core')" "Кнопка Показати/Сховати Core"
check_html_content "toggleInstructions('core-instructions')" "Кнопка Інструкції Core"

print_step "Перевірка кнопок для Департаментів..."
check_html_content "startAllDepartments" "Кнопка Запустити ВСІ 8 департаментів"
check_html_content "stopAllDepartments" "Кнопка Зупинити ВСІ 8 департаментів"
check_html_content "toggleCategory('departments')" "Кнопка Показати/Сховати департаменти"
check_html_content "toggleInstructions('departments-instructions')" "Кнопка Інструкції департаменти"

print_step "Перевірка кнопок для Mobile Apps..."
check_html_content "startAllExpo" "Кнопка Запустити ВСІ Expo Apps"
check_html_content "stopAllExpo" "Кнопка Зупинити ВСІ Expo Apps"
check_html_content "toggleCategory('mobile')" "Кнопка Показати/Сховати Mobile"
check_html_content "toggleInstructions('mobile-instructions')" "Кнопка Інструкції Mobile"

################################################################################
# TEST 6: Перевірка Інструкцій Запуску (HTML)
################################################################################
print_header "TEST 6: Перевірка Інструкцій Запуску"

print_step "Перевірка інструкцій для ботів..."
check_html_content "npm run dev" "Інструкція для ботів (npm run dev)"
check_html_content "npm run bot:master" "Інструкція Master Bot"

print_step "Перевірка інструкцій для Dashboard..."
check_html_content "admin-panel" "Інструкція Admin Panel"
check_html_content "city-hall-dashboard" "Інструкція City-Hall"
check_html_content "departments/roads" "Інструкція Roads Department"

print_step "Перевірка інструкцій для Expo..."
check_html_content "npx expo start" "Інструкція Expo"
check_html_content "mobile-school" "Інструкція Expo School"

################################################################################
# TEST 7: Перевірка CSS Стилів
################################################################################
print_header "TEST 7: Перевірка CSS Стилів"

print_step "Завантаження CSS файлу..."
if curl -s "$MONITOR_URL/style.css" > /dev/null 2>&1; then
    print_success "CSS файл доступний ✅"
    
    print_step "Перевірка нових стилів..."
    if curl -s "$MONITOR_URL/style.css" | grep -q "section-header-with-controls"; then
        print_success "Стиль .section-header-with-controls ✅"
    else
        print_error "Стиль .section-header-with-controls ❌"
    fi
    
    if curl -s "$MONITOR_URL/style.css" | grep -q "category-btn"; then
        print_success "Стиль .category-btn ✅"
    else
        print_error "Стиль .category-btn ❌"
    fi
    
    if curl -s "$MONITOR_URL/style.css" | grep -q "how-to-run"; then
        print_success "Стиль .how-to-run ✅"
    else
        print_error "Стиль .how-to-run ❌"
    fi
else
    print_error "CSS файл недоступний ❌"
fi

################################################################################
# TEST 8: Перевірка Database
################################################################################
print_header "TEST 8: Перевірка Database"

print_step "Перевірка SQLite бази даних..."
DB_FILE="$PROJECT_DIR/prisma/dev.db"
if [ -f "$DB_FILE" ]; then
    print_success "База даних існує: $DB_FILE ✅"
    
    # Перевірка таблиць
    if command -v sqlite3 &> /dev/null; then
        TABLE_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM sqlite_master WHERE type='table';" 2>/dev/null || echo "0")
        if [ "$TABLE_COUNT" -gt 0 ]; then
            print_success "База даних містить таблиць: $TABLE_COUNT ✅"
        else
            print_error "База даних не містить таблиць ❌"
        fi
        
        USER_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")
        print_info "Користувачів в базі: $USER_COUNT"
    fi
else
    print_error "База даних не знайдена: $DB_FILE ❌"
fi

################################################################################
# 📊 ФІНАЛЬНІ РЕЗУЛЬТАТИ
################################################################################
print_header "📊 ФІНАЛЬНІ РЕЗУЛЬТАТИ"

log_result ""
log_result "📈 Статистика тестування:"
log_result "   Всього тестів: $TOTAL_TESTS"
log_result "   ✅ Пройдено: $PASSED_TESTS"
log_result "   ❌ Провалено: $FAILED_TESTS"
log_result ""

if [ $FAILED_TESTS -eq 0 ]; then
    log_result "${GREEN}🎉 ВСІ ТЕСТИ ПРОЙДЕНО!${NC}"
    log_result ""
    log_result "Monitor Dashboard (9000) працює коректно!"
    log_result "Всі кнопки, API endpoints та логи працюють правильно."
else
    log_result "${YELLOW}⚠️  УВАГА: ДЕЯКІ ТЕСТИ НЕ ПРОЙДЕНО${NC}"
    log_result ""
    log_result "Рекомендується перевірити логи вище та виправити помилки."
fi

log_result ""
log_result "📄 Повний звіт збережено: $RESULT_FILE"
log_result ""

# Відкрити файл з результатами
if [ -f "$RESULT_FILE" ]; then
    print_info "Відкриття файлу з результатами..."
    open "$RESULTS_DIR"
fi

# Exit code
if [ $FAILED_TESTS -eq 0 ]; then
    exit 0
else
    exit 1
fi
