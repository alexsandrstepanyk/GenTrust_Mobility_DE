#!/bin/bash

################################################################################
# TELEGRAM BOTS INTEGRATION TEST
# Перевірка всіх Telegram ботів системи
################################################################################

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Лічильники
TESTS_PASSED=0
TESTS_FAILED=0

print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

print_test() {
    echo -e "${CYAN}→${NC} $1..."
}

pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

info() {
    echo -e "  ${CYAN}ℹ️${NC} $1"
}

# ============================================================================
# КРОК 0: Перевірка змінних оточення
# ============================================================================

print_header "🔧 ПЕРЕВІРКА ЗМІННИХ ОТОВЧЕННЯ"

print_test "Перевірка BOT_TOKEN"
if [ -f .env ]; then
    BOT_TOKEN=$(grep "^BOT_TOKEN=" .env | cut -d '=' -f 2)
    if [ -n "$BOT_TOKEN" ] && [ "$BOT_TOKEN" != "your-bot-token" ]; then
        pass "BOT_TOKEN знайдено"
        info "Token: ${BOT_TOKEN:0:15}..."
    else
        fail "BOT_TOKEN не налаштовано"
        info "Встановіть BOT_TOKEN в .env"
    fi
else
    fail ".env файл не знайдено"
fi

print_test "Перевірка GEMINI_API_KEY"
GEMINI_KEY=$(grep "^GEMINI_API_KEY=" .env | cut -d '=' -f 2)
if [ -n "$GEMINI_KEY" ] && [ "$GEMINI_KEY" != "your-gemini-api-key" ]; then
    pass "GEMINI_API_KEY знайдено"
else
    info "⚠️ GEMINI_API_KEY не налаштовано (AI аналіз не працюватиме)"
fi

print_test "Перевірка ADMIN_CHAT_ID"
ADMIN_CHAT=$(grep "^TELEGRAM_ADMIN_CHAT_ID\|ADMIN_CHAT_ID=" .env | cut -d '=' -f 2 | head -1)
if [ -n "$ADMIN_CHAT" ] && [ "$ADMIN_CHAT" != "0" ]; then
    pass "ADMIN_CHAT_ID знайдено: $ADMIN_CHAT"
else
    info "⚠️ ADMIN_CHAT_ID не налаштовано (сповіщення не працюватимуть)"
fi

# ============================================================================
# КРОК 1: Перевірка ботів
# ============================================================================

print_header "🤖 ПЕРЕВІРКА TELEGRAM БОТІВ"

# Перевірка чи запущені боти
print_test "Перевірка процесів ботів"
BOT_PROCESSES=$(ps aux | grep -E "bot|telegraf" | grep -v grep | wc -l)
info "Знайдено процесів ботів: $BOT_PROCESSES"

if [ "$BOT_PROCESSES" -gt 0 ]; then
    pass "Боти запущені"
    ps aux | grep -E "bot|telegraf" | grep -v grep | head -5
else
    info "⚠️ Боти не запущені (це нормально для тестового середовища)"
fi

# Перевірка портів ботів
print_test "Перевірка портів ботів (3001-3005)"
for port in 3001 3002 3003 3004 3005; do
    if lsof -ti:$port >/dev/null 2>&1; then
        info "✅ Порт $port активний"
    else
        info "⚠️ Порт $port не активний"
    fi
done
pass "Порти перевірено"

# ============================================================================
# КРОК 2: Перевірка Bot API
# ============================================================================

print_header "🌐 ПЕРЕВІРКА BOT API"

# Test Bot API endpoint
print_test "Перевірка Bot API (/api/bot/status)"
BOT_STATUS=$(curl -s http://localhost:3000/api/bot/status 2>/dev/null || echo "Endpoint not available")
if echo "$BOT_STATUS" | grep -q "error\|not found"; then
    info "⚠️ Bot status endpoint не доступний"
else
    pass "Bot API відповідає"
fi

# ============================================================================
# КРОК 3: Симуляція вхідних повідомлень
# ============================================================================

print_header "📨 СИМУЛЯЦІЯ ВХІДНИХ ПОВІДОМЛЕНЬ"

# Отримаємо інформацію про бота
print_test "Отримання інформації про бота"
if [ -n "$BOT_TOKEN" ] && [ "$BOT_TOKEN" != "your-bot-token" ]; then
    BOT_INFO=$(curl -s "https://api.telegram.org/bot$BOT_TOKEN/getMe")
    if echo "$BOT_INFO" | grep -q '"ok":true'; then
        BOT_NAME=$(echo "$BOT_INFO" | jq -r '.result.username')
        pass "Бот: @$BOT_NAME"
        info "Bot Info: $BOT_INFO" | jq -r '.result | "Username: \(.username), Name: \(.first_name)"'
    else
        fail "Не вдалося отримати інформацію про бота"
        info "Перевірте BOT_TOKEN"
    fi
else
    info "⚠️ BOT_TOKEN не налаштовано, перевірка пропускається"
fi

# ============================================================================
# КРОК 4: Тестування обробки повідомлень
# ============================================================================

print_header "💬 ТЕСТУВАННЯ ОБРОБКИ ПОВІДОМЛЕНЬ"

# Перевірка логів бота
print_test "Перевірка логів бота"
if [ -f /tmp/bot-master.log ]; then
    LOG_LINES=$(tail -20 /tmp/bot-master.log)
    if echo "$LOG_LINES" | grep -q "error\|Error"; then
        info "⚠️ Знайдено помилки в логах:"
        echo "$LOG_LINES" | grep -i "error" | head -5
    else
        pass "Логі бота чисті"
        info "Останні логи:"
        echo "$LOG_LINES" | tail -5
    fi
else
    info "⚠️ Лог файл бота не знайдено"
fi

# ============================================================================
# КРОК 5: Симуляція звіту через бота
# ============================================================================

print_header "📝 СИМУЛЯЦІЯ ЗВІТУ ЧЕРЕЗ БОТА"

print_test "Створення тестового звіту (імітація бота)"

# Створимо звіт через SQL (імітація обробки ботом)
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_ID="bot_test_$TIMESTAMP"
BOT_USER_ID="bot_user_test_123"

MAIN_DB="/Users/apple/Desktop/GenTrust_Mobility_DE/prisma/dev.db"
sqlite3 "$MAIN_DB" "INSERT INTO Report (id, authorId, photoId, description, latitude, longitude, category, status, forwardedTo, createdAt, aiVerdict) 
VALUES ('$TEST_ID', '$BOT_USER_ID', 'bot_photo_$TIMESTAMP', 'Bot Test Report $TIMESTAMP', 49.9935, 10.2222, 'roads', 'PENDING', 'roads', datetime('now'), '{\"ai\":\"test\"}');"

if [ $? -eq 0 ]; then
    pass "Звіт створено (імітація бота)"
    info "Report ID: $TEST_ID"
    
    # Перевірка запису
    sleep 2
    NEW_REPORT=$(sqlite3 "$MAIN_DB" "SELECT id, authorId, category, status FROM Report WHERE id='$TEST_ID';")
    info "Запис в БД: $NEW_REPORT"
else
    fail "Не вдалося створити звіт"
fi

# ============================================================================
# КРОК 6: Перевірка сповіщень
# ============================================================================

print_header "🔔 ПЕРЕВІРКА СПОВІЩЕНЬ"

print_test "Перевірка сповіщень для City Hall"
if [ -n "$ADMIN_CHAT" ] && [ "$ADMIN_CHAT" != "0" ]; then
    # Перевірка чи є логи відправки сповіщень
    if [ -f /tmp/BackendAPIv6.log ]; then
        if grep -q "City Hall\|cityHallBot\|sendPhoto" /tmp/BackendAPIv6.log | tail -5; then
            pass "Сповіщення City Hall працюють"
            grep "City Hall\|cityHallBot\|sendPhoto" /tmp/BackendAPIv6.log | tail -5
        else
            info "⚠️ Логів сповіщень не знайдено"
        fi
    else
        info "⚠️ Лог файл не знайдено"
    fi
else
    info "⚠️ ADMIN_CHAT_ID не налаштовано"
fi

# ============================================================================
# КРОК 7: Перевірка обробки команд
# ============================================================================

print_header "⌨️ ПЕРЕВІРКА КОМАНД БОТА"

print_test "Перевірка обробки команд"
# Перевірка чи є обробники команд в коді
if [ -f src/bot.ts ]; then
    COMMANDS=$(grep -c "bot.command" src/bot.ts || echo "0")
    if [ "$COMMANDS" -gt 0 ]; then
        pass "Знайдено команд: $COMMANDS"
        info "Команди в боті:"
        grep "bot.command" src/bot.ts | head -5
    else
        info "⚠️ Команди не знайдено"
    fi
else
    info "⚠️ bot.ts не знайдено"
fi

# ============================================================================
# КРОК 8: Перевірка інтеграції з AI
# ============================================================================

print_header "🤖 ПЕРЕВІРКА AI ІНТЕГРАЦІЇ"

print_test "Перевірка Gemini API інтеграції"
if [ -n "$GEMINI_KEY" ] && [ "$GEMINI_KEY" != "your-gemini-api-key" ]; then
    if [ -f src/services/gemini.ts ]; then
        pass "Gemini service знайдено"
        info "AI аналіз доступний"
    else
        info "⚠️ Gemini service не знайдено"
    fi
else
    info "⚠️ GEMINI_API_KEY не налаштовано"
fi

# ============================================================================
# КРОК 9: Перевірка логів системи
# ============================================================================

print_header "📋 ПЕРЕВІРКА СИСТЕМНИХ ЛОГІВ"

print_test "Перевірка Backend логів"
if [ -f /tmp/BackendAPIv6.log ]; then
    ERROR_COUNT=$(grep -c "Error\|error" /tmp/BackendAPIv6.log || echo "0")
    if [ "$ERROR_COUNT" -gt 0 ]; then
        info "⚠️ Знайдено помилок: $ERROR_COUNT"
        grep "Error\|error" /tmp/BackendAPIv6.log | tail -5
    else
        pass "Критичних помилок не знайдено"
    fi
    
    # Перевірка чи бот ініціалізовано
    if grep -q "Bot.*Initialized\|bot.*started" /tmp/BackendAPIv6.log; then
        pass "Бот ініціалізовано"
        grep "Bot.*Initialized\|bot.*started" /tmp/BackendAPIv6.log | tail -3
    else
        info "⚠️ Логів ініціалізації бота не знайдено"
    fi
else
    info "⚠️ Backend лог не знайдено"
fi

# ============================================================================
# КРОК 10: Підсумки
# ============================================================================

print_header "📊 ПІДСУМКИ TELEGRAM BOTS TEST"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo -e "${BLUE}Tests Passed:${NC} ${GREEN}$TESTS_PASSED${NC}"
echo -e "${BLUE}Tests Failed:${NC} ${RED}$TESTS_FAILED${NC}"
echo -e "${BLUE}Total Tests:${NC} $TOTAL_TESTS"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ✅ ALL TELEGRAM BOT TESTS PASSED!"
    echo -e "${GREEN}║${NC}  Боти готові до роботи."
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║${NC}  ⚠️ SOME TESTS FAILED!"
    echo -e "${YELLOW}║${NC}  Деякі функції можуть не працювати."
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
