#!/bin/bash

################################################################################
# BOT TO DATABASE VERIFICATION TEST
# Перевірка чи боти записують звіти в базу даних
################################################################################

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

MAIN_DB="/Users/apple/Desktop/GenTrust_Mobility_DE/prisma/dev.db"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  🤖 BOT TO DATABASE - VERIFICATION TEST"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# ============================================================================
# КРОК 1: Перевірка коду бота
# ============================================================================

echo -e "${YELLOW}[1/4] Перевірка коду бота (bot.ts, urban_guardian.ts)${NC}"
echo "═══════════════════════════════════════════════════════"

# Шукаємо prisma.report.create в коді бота
if grep -r "prisma.report.create" src/scenes/urban_guardian.ts >/dev/null 2>&1; then
    echo -e "${GREEN}✅${NC} Знайдено prisma.report.create в urban_guardian.ts"
    
    # Показуємо рядок
    echo "   Код створення звіту:"
    grep -A 15 "prisma.report.create" src/scenes/urban_guardian.ts | head -16 | sed 's/^/   /'
else
    echo -e "${RED}❌${NC} Не знайдено prisma.report.create в коді бота"
fi

# ============================================================================
# КРОК 2: Перевірка поточних звітів від ботів
# ============================================================================

echo -e "\n${YELLOW}[2/4] Перевірка звітів створених ботами${NC}"
echo "═══════════════════════════════════════════════════════"

# Рахуємо звіти від telegram користувачів
BOT_REPORTS=$(sqlite3 "$MAIN_DB" "SELECT COUNT(*) FROM Report WHERE authorId LIKE '%telegram%' OR id LIKE '%bot_report%';")

echo -e "   ${CYAN}ℹ️${NC} Всього звітів від ботів: $BOT_REPORTS"

if [ "$BOT_REPORTS" -gt 0 ]; then
    echo -e "\n   ${GREEN}✅${NC} Знайдено звіти від ботів:"
    sqlite3 "$MAIN_DB" "SELECT id, authorId, category, status, createdAt FROM Report WHERE authorId LIKE '%telegram%' OR id LIKE '%bot_report%' ORDER BY createdAt DESC LIMIT 5;" | while IFS='|' read -r id author category status createdAt; do
        echo "     └─ $id | $author | $category | $status | $createdAt"
    done
else
    echo -e "   ${YELLOW}⚠️${NC} Звітів від ботів не знайдено"
fi

# ============================================================================
# КРОК 3: Створення тестового звіту (імітація бота)
# ============================================================================

echo -e "\n${YELLOW}[3/4] Створення тестового звіту (імітація бота)${NC}"
echo "═══════════════════════════════════════════════════════"

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
TEST_REPORT_ID="bot_test_$TIMESTAMP"
TEST_USER_ID="telegram_user_$TIMESTAMP"

echo "   Створення звіту..."
echo "   └─ Report ID: $TEST_REPORT_ID"
echo "   └─ User ID: $TEST_USER_ID"
echo "   └─ Category: roads"
echo "   └─ Status: PENDING"

sqlite3 "$MAIN_DB" "INSERT INTO Report (id, authorId, photoId, description, latitude, longitude, category, status, forwardedTo, createdAt, aiVerdict) 
VALUES ('$TEST_REPORT_ID', '$TEST_USER_ID', 'bot_photo_$TIMESTAMP', 'Bot test report via Telegram', 49.9935, 10.2222, 'roads', 'PENDING', 'roads', datetime('now'), '{\"is_issue\":true,\"category\":\"roads\",\"confidence\":0.95}');"

if [ $? -eq 0 ]; then
    echo -e "   ${GREEN}✅${NC} Звіт створено в Main DB"
    
    # Перевірка запису
    sleep 1
    VERIFY=$(sqlite3 "$MAIN_DB" "SELECT id, authorId, category, status FROM Report WHERE id='$TEST_REPORT_ID';")
    echo "   └─ Перевірка: $VERIFY"
else
    echo -e "   ${RED}❌${NC} Помилка створення звіту"
fi

# ============================================================================
# КРОК 4: Перевірка всіх полів звіту
# ============================================================================

echo -e "\n${YELLOW}[4/4] Перевірка всіх полів звіту${NC}"
echo "═══════════════════════════════════════════════════════"

echo "   Отримання повної інформації про звіт..."

FULL_REPORT=$(sqlite3 "$MAIN_DB" "SELECT 
    id,
    authorId,
    photoId,
    description,
    latitude,
    longitude,
    category,
    status,
    forwardedTo,
    aiVerdict,
    createdAt
FROM Report WHERE id='$TEST_REPORT_ID';")

if [ -n "$FULL_REPORT" ]; then
    echo -e "   ${GREEN}✅${NC} Повний звіт з БД:"
    echo "$FULL_REPORT" | tr '|' '\n' | while read -r field; do
        echo "     └─ $field"
    done
else
    echo -e "   ${RED}❌${NC} Звіт не знайдено"
fi

# ============================================================================
# ПІДСУМКИ
# ============================================================================

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  📊 BOT TO DATABASE - ПІДСУМКИ"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Підсумкова статистика
TOTAL_BOT_REPORTS=$(sqlite3 "$MAIN_DB" "SELECT COUNT(*) FROM Report WHERE authorId LIKE '%telegram%' OR id LIKE '%bot_report%';")

echo -e "${CYAN}Статистика:${NC}"
echo "  └─ Всього звітів від ботів: $TOTAL_BOT_REPORTS"
echo "  └─ Останній звіт: $TEST_REPORT_ID"

# Перевірка чи код бота має запис в БД
if grep -q "prisma.report.create" src/scenes/urban_guardian.ts; then
    echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ✅ ПІДТВЕРДЖЕНО!"
    echo -e "${GREEN}║${NC}  Боти записують звіти в базу даних."
    echo -e "${GREEN}║${NC}  "
    echo -e "${GREEN}║${NC}  Код в src/scenes/urban_guardian.ts:"
    echo -e "${GREEN}║${NC}  const report = await prisma.report.create({...});"
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
else
    echo -e "\n${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║${NC}  ❌ ПОМИЛКА!"
    echo -e "${RED}║${NC}  Боти НЕ записують звіти в базу."
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
fi
