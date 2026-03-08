#!/bin/bash

################################################################################
# СИСТЕМНИЙ ТЕСТ ВСІХ СЕРВІСІВ GENETRUST MOBILITY
# Перевіряє всі порти, логи, API endpoints та бази даних
#
# Використання:
#   bash tests/system/test_all_services.sh
#
# Результати зберігаються в: tests/system/results/test_results_YYYY-MM-DD_HH-MM-SS.txt
################################################################################

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
RESULTS_DIR="$PROJECT_DIR/tests/system/results"
TIMESTAMP=$(date +%Y-%m-%d_%H-%M-%S)
RESULT_FILE="$RESULTS_DIR/test_results_$TIMESTAMP.txt"

# Створення папки результатів
mkdir -p "$RESULTS_DIR"

# Лічильники
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Функція для запису результатів
log_result() {
    echo "$1" | tee -a "$RESULT_FILE"
}

# Функція тестування порту
test_port() {
    local port=$1
    local service_name=$2
    local expected=$3  # "occupied" або "free"
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ "$expected" == "occupied" ]; then
        if lsof -ti:$port > /dev/null 2>&1; then
            log_result "${GREEN}✅ PASS${NC}: $service_name (порт $port) - ЗАЙНЯТИЙ"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            log_result "${RED}❌ FAIL${NC}: $service_name (порт $port) - ВІЛЬНИЙ (очікувався ЗАЙНЯТИЙ)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        fi
    else
        if lsof -ti:$port > /dev/null 2>&1; then
            log_result "${RED}❌ FAIL${NC}: $service_name (порт $port) - ЗАЙНЯТИЙ (очікувався ВІЛЬНИЙ)"
            FAILED_TESTS=$((FAILED_TESTS + 1))
            return 1
        else
            log_result "${GREEN}✅ PASS${NC}: $service_name (порт $port) - ВІЛЬНИЙ"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        fi
    fi
}

# Функція тестування API endpoint
test_api_endpoint() {
    local url=$1
    local expected_code=$2
    local description=$3
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
    
    if [ "$response" == "$expected_code" ]; then
        log_result "${GREEN}✅ PASS${NC}: $description - $url (статус: $response)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log_result "${RED}❌ FAIL${NC}: $description - $url (статус: $response, очікувався: $expected_code)"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Функція тестування лог файлу
test_log_file() {
    local log_file=$1
    local service_name=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -f "$log_file" ]; then
        # Перевіряємо чи є ознаки успішного запуску
        if grep -q "ready\|started\|listening" "$log_file" 2>/dev/null; then
            log_result "${GREEN}✅ PASS${NC}: $service_name - лог файл існує і містить ознаки успішного запуску"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        else
            log_result "${YELLOW}⚠️ WARN${NC}: $service_name - лог файл існує, але не містить ознак успішного запуску"
            PASSED_TESTS=$((PASSED_TESTS + 1))
            return 0
        fi
    else
        log_result "${RED}❌ FAIL${NC}: $service_name - лог файл не знайдено: $log_file"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Функція тестування бази даних
test_database() {
    local db_path=$1
    local db_name=$2
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if [ -f "$db_path" ]; then
        # Перевіряємо кількість користувачів
        local user_count=$(sqlite3 "$db_path" "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")
        log_result "${GREEN}✅ PASS${NC}: $db_name - база існує ($user_count користувачів)"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log_result "${RED}❌ FAIL${NC}: $db_name - база не знайдено: $db_path"
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

################################################################################
# ПОЧАТОК ТЕСТУВАННЯ
################################################################################

log_result "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
log_result "${BLUE}║${NC}  GENETRUST MOBILITY - СИСТЕМНИЙ ТЕСТ ВСІХ СЕРВІСІВ"
log_result "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
log_result ""
log_result "${YELLOW}Дата:${NC} $(date)"
log_result "${YELLOW}Файл результатів:${NC} $RESULT_FILE"
log_result ""

################################################################################
# 1. ТЕСТУВАННЯ ПОРТІВ
################################################################################

log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result "${CYAN}1️⃣  ТЕСТУВАННЯ ПОРТІВ${NC}"
log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result ""

# Основні сервіси
log_result "${YELLOW}→ Основні сервіси:${NC}"
test_port 3000 "Backend API" "occupied"
test_port 9000 "Monitor Dashboard" "occupied"
test_port 5173 "City-Hall Dashboard" "occupied"
test_port 5174 "Admin Panel" "occupied"
test_port 5175 "Department Dashboard (Base)" "occupied"
log_result ""

# 8 Департаментів
log_result "${YELLOW}→ 8 Департаментів:${NC}"
test_port 5180 "Dept: Roads (🛣️)" "occupied"
test_port 5181 "Dept: Lighting (💡)" "occupied"
test_port 5182 "Dept: Waste (🗑️)" "occupied"
test_port 5183 "Dept: Parks (🌳)" "occupied"
test_port 5184 "Dept: Water (🚰)" "occupied"
test_port 5185 "Dept: Transport (🚌)" "occupied"
test_port 5186 "Dept: Ecology (🌿)" "occupied"
test_port 5187 "Dept: Vandalism (🎨)" "occupied"
log_result ""

################################################################################
# 2. ТЕСТУВАННЯ API ENDPOINTS
################################################################################

log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result "${CYAN}2️⃣  ТЕСТУВАННЯ API ENDPOINTS${NC}"
log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result ""

test_api_endpoint "http://localhost:3000/api/health" "200" "Backend Health Check"
test_api_endpoint "http://localhost:3000/api/reports" "200" "Reports API"
test_api_endpoint "http://localhost:3000/api/users" "200" "Users API"
test_api_endpoint "http://localhost:3000/api/stats/dashboard" "401" "Stats Dashboard API (потребує auth)"
log_result ""

################################################################################
# 3. ТЕСТУВАННЯ ЛОГ ФАЙЛІВ
################################################################################

log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result "${CYAN}3️⃣  ТЕСТУВАННЯ ЛОГ ФАЙЛІВ${NC}"
log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result ""

log_result "${YELLOW}→ Backend та Monitor:${NC}"
test_log_file "/tmp/BackendAPIзботами.log" "Backend API"
test_log_file "/tmp/Monitor.log" "Monitor Dashboard"
log_result ""

log_result "${YELLOW}→ Core Dashboards:${NC}"
test_log_file "/tmp/City-HallDashboard.log" "City-Hall Dashboard"
test_log_file "/tmp/AdminPanelCoreDashboard.log" "Admin Panel"
test_log_file "/tmp/DepartmentDashboard.log" "Department Dashboard (Base)"
log_result ""

log_result "${YELLOW}→ 8 Департаментів:${NC}"
test_log_file "/tmp/Dept:Roads.log" "Dept: Roads"
test_log_file "/tmp/Dept:Lighting.log" "Dept: Lighting"
test_log_file "/tmp/Dept:Waste.log" "Dept: Waste"
test_log_file "/tmp/Dept:Parks.log" "Dept: Parks"
test_log_file "/tmp/Dept:Water.log" "Dept: Water"
test_log_file "/tmp/Dept:Transport.log" "Dept: Transport"
test_log_file "/tmp/Dept:Ecology.log" "Dept: Ecology"
test_log_file "/tmp/Dept:Vandalism.log" "Dept: Vandalism"
log_result ""

################################################################################
# 4. ТЕСТУВАННЯ БАЗИ ДАНИХ
################################################################################

log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result "${CYAN}4️⃣  ТЕСТУВАННЯ БАЗИ ДАНИХ${NC}"
log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result ""

test_database "$PROJECT_DIR/prisma/dev.db" "Головна БД"
log_result ""

################################################################################
# 5. ПЕРЕВІРКА ПРОЦЕСІВ
################################################################################

log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result "${CYAN}5️⃣  ПЕРЕВІРКА ПРОЦЕСІВ${NC}"
log_result "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
log_result ""

TOTAL_TESTS=$((TOTAL_TESTS + 1))
NODE_COUNT=$(ps aux | grep -E "node|npm|vite" | grep -v grep | wc -l | tr -d ' ')

if [ "$NODE_COUNT" -gt 10 ]; then
    log_result "${GREEN}✅ PASS${NC}: Знайдено достатньо процесів Node.js ($NODE_COUNT)"
    PASSED_TESTS=$((PASSED_TESTS + 1))
else
    log_result "${RED}❌ FAIL${NC}: Занадто мало процесів Node.js ($NODE_COUNT, очікувалось > 10)"
    FAILED_TESTS=$((FAILED_TESTS + 1))
fi
log_result ""

################################################################################
# ПІДСУМКИ
################################################################################

log_result ""
log_result "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
log_result "${BLUE}║${NC}  ПІДСУМКИ ТЕСТУВАННЯ"
log_result "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
log_result ""
log_result "Всього тестів: ${YELLOW}$TOTAL_TESTS${NC}"
log_result "${GREEN}✅ Пройдено: $PASSED_TESTS${NC}"
log_result "${RED}❌ Не пройдено: $FAILED_TESTS${NC}"
log_result ""

SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
log_result "Успішність: ${GREEN}${SUCCESS_RATE}%${NC}"
log_result ""

if [ "$FAILED_TESTS" -eq 0 ]; then
    log_result "${GREEN}🎉 ВСІ ТЕСТИ ПРОЙДЕНО УСПІШНО!${NC}"
    log_result ""
    log_result "${CYAN}Доступні посилання:${NC}"
    log_result "  🌐 Monitor:        http://localhost:9000"
    log_result "  🔧 Backend API:    http://localhost:3000/api"
    log_result "  🏛️ City-Hall:      http://localhost:5173"
    log_result "  🔐 Admin Panel:    http://localhost:5174"
    log_result "  🏢 Departments:    http://localhost:5180-5187"
    exit 0
else
    log_result "${RED}⚠️  ДЕЯКІ ТЕСТИ НЕ ПРОЙДЕНО${NC}"
    log_result ""
    log_result "${YELLOW}Рекомендації:${NC}"
    log_result "  1. Перевірте логи невдалих сервісів"
    log_result "  2. Спробуйте перезапустити: bash start.sh"
    log_result "  3. Перевірте конфігурацію портів"
    exit 1
fi
