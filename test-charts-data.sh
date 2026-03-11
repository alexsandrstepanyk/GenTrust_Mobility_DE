#!/bin/bash

################################################################################
# GENTRUST MOBILITY - CHARTS DATA TEST
# Перевірка даних для графіків в дашбордах
################################################################################

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  📊 GENTRUST MOBILITY - CHARTS DATA TEST"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Wait for rate limit
sleep 3

# Get stats data
echo -e "${CYAN}→${NC} Fetching stats from /api/stats/dashboard..."
STATS=$(curl -s http://localhost:3000/api/stats/dashboard)

if echo "$STATS" | grep -q "Too many requests"; then
    echo -e "${RED}❌ Rate limit exceeded. Wait 15 minutes and try again.${NC}"
    exit 1
fi

# ============================================================================
# 1. MAIN STATISTICS
# ============================================================================

echo -e "\n${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  1. MAIN STATISTICS${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}\n"

TOTAL=$(echo "$STATS" | jq -r '.reports.total')
PENDING=$(echo "$STATS" | jq -r '.reports.pending')
IN_PROGRESS=$(echo "$STATS" | jq -r '.reports.inProgress')
APPROVED=$(echo "$STATS" | jq -r '.reports.approved')

echo -e "${GREEN}📊 Reports Overview:${NC}"
echo -e "   Total:     $TOTAL"
echo -e "   Pending:   $PENDING"
echo -e "   In Prog:   $IN_PROGRESS"
echo -e "   Approved:  $APPROVED"

if [ "$TOTAL" -gt 0 ]; then
    echo -e "${GREEN}✅ PASS:${NC} Total reports > 0"
else
    echo -e "${RED}❌ FAIL:${NC} Total reports is 0"
fi

# ============================================================================
# 2. DAILY REPORTS (AreaChart/BarChart Data)
# ============================================================================

echo -e "\n${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  2. DAILY REPORTS (Chart: Звіти за часом)${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}\n"

DAILY=$(echo "$STATS" | jq -r '.reports.dailyReports')
DAYS_COUNT=$(echo "$STATS" | jq -r '.reports.dailyReports | length')

echo -e "${GREEN}📅 Daily data points: $DAYS_COUNT days${NC}\n"

echo "$DAILY" | jq -r '.[] | "   \(.date): \(.count) reports"'

if [ "$DAYS_COUNT" -gt 0 ]; then
    echo -e "\n${GREEN}✅ PASS:${NC} Daily reports data available"
    
    # Check for recent data
    LATEST_DATE=$(echo "$DAILY" | jq -r '.[-1].date')
    LATEST_COUNT=$(echo "$DAILY" | jq -r '.[-1].count')
    echo -e "   Latest: $LATEST_DATE with $LATEST_COUNT reports"
else
    echo -e "\n${RED}❌ FAIL:${NC} No daily reports data"
fi

# ============================================================================
# 3. CATEGORY DISTRIBUTION (PieChart Data)
# ============================================================================

echo -e "\n${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  3. CATEGORY DISTRIBUTION (Chart: Розподіл за категоріями)${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}\n"

CATEGORIES=$(echo "$STATS" | jq -r '.reports.byCategory')
CAT_COUNT=$(echo "$STATS" | jq -r '.reports.byCategory | length')

echo -e "${GREEN}📂 Total categories: $CAT_COUNT${NC}\n"

echo "$CATEGORIES" | jq -r 'sort_by(-.count) | .[] | "   \(.category): \(.count)"'

if [ "$CAT_COUNT" -gt 0 ]; then
    echo -e "\n${GREEN}✅ PASS:${NC} Category data available"
    
    # Check main departments
    echo -e "\n${CYAN}🏢 Department breakdown:${NC}"
    for dept in roads lighting waste parks water transport ecology vandalism; do
        DEPT_COUNT=$(echo "$CATEGORIES" | jq -r ".[] | select(.category == \"$dept\") | .count")
        if [ -n "$DEPT_COUNT" ] && [ "$DEPT_COUNT" != "null" ]; then
            echo -e "   $dept: $DEPT_COUNT"
        fi
    done
else
    echo -e "\n${RED}❌ FAIL:${NC} No category data"
fi

# ============================================================================
# 4. STATUS DISTRIBUTION (PieChart: Поточний стан)
# ============================================================================

echo -e "\n${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  4. STATUS DISTRIBUTION (Chart: Поточний стан)${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}\n"

echo -e "${GREEN}📊 Status breakdown:${NC}"
echo -e "   PENDING:     $PENDING"
echo -e "   IN_PROGRESS: $IN_PROGRESS"
echo -e "   APPROVED:    $APPROVED"

# Calculate percentages
if [ "$TOTAL" -gt 0 ]; then
    PENDING_PCT=$((PENDING * 100 / TOTAL))
    IN_PROGRESS_PCT=$((IN_PROGRESS * 100 / TOTAL))
    APPROVED_PCT=$((APPROVED * 100 / TOTAL))
    
    echo -e "\n${CYAN}📈 Percentages:${NC}"
    echo -e "   Pending:     $PENDING_PCT%"
    echo -e "   In Progress: $IN_PROGRESS_PCT%"
    echo -e "   Approved:    $APPROVED_PCT%"
fi

# ============================================================================
# 5. USERS & QUESTS STATS
# ============================================================================

echo -e "\n${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  5. USERS & QUESTS STATS${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}\n"

USERS_TOTAL=$(echo "$STATS" | jq -r '.users.total')
USERS_ACTIVE=$(echo "$STATS" | jq -r '.users.active')
USERS_PENDING=$(echo "$STATS" | jq -r '.users.pending')

QUESTS_TOTAL=$(echo "$STATS" | jq -r '.quests.total')
QUESTS_OPEN=$(echo "$STATS" | jq -r '.quests.open')
QUESTS_COMPLETED=$(echo "$STATS" | jq -r '.quests.completed')

echo -e "${GREEN}👥 Users:${NC}"
echo -e "   Total:     $USERS_TOTAL"
echo -e "   Active:    $USERS_ACTIVE"
echo -e "   Pending:   $USERS_PENDING"

echo -e "\n${GREEN}🎯 Quests:${NC}"
echo -e "   Total:      $QUESTS_TOTAL"
echo -e "   Open:       $QUESTS_OPEN"
echo -e "   Completed:  $QUESTS_COMPLETED"

# ============================================================================
# 6. DEPARTMENT DATABASES SYNC
# ============================================================================

echo -e "\n${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  6. DEPARTMENT DATABASES SYNC${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}\n"

DB_PATH="/Users/apple/Desktop/GenTrust_Mobility_DE/databases"

echo -e "${CYAN}🏢 Department DB reports:${NC}"
for dept in roads lighting waste parks water transport ecology vandalism; do
    DEPT_COUNT=$(sqlite3 "$DB_PATH/${dept}_dept.db" "SELECT COUNT(*) FROM DepartmentReport;" 2>/dev/null || echo "0")
    echo -e "   $dept: $DEPT_COUNT"
done

# ============================================================================
# SUMMARY
# ============================================================================

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  📊 CHARTS DATA TEST SUMMARY"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

PASS_COUNT=0
FAIL_COUNT=0

[ "$TOTAL" -gt 0 ] && PASS_COUNT=$((PASS_COUNT + 1)) || FAIL_COUNT=$((FAIL_COUNT + 1))
[ "$DAYS_COUNT" -gt 0 ] && PASS_COUNT=$((PASS_COUNT + 1)) || FAIL_COUNT=$((FAIL_COUNT + 1))
[ "$CAT_COUNT" -gt 0 ] && PASS_COUNT=$((PASS_COUNT + 1)) || FAIL_COUNT=$((FAIL_COUNT + 1))

echo -e "${GREEN}Tests Passed: $PASS_COUNT${NC}"
echo -e "${RED}Tests Failed: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ✅ ALL CHARTS DATA AVAILABLE!"
    echo -e "${GREEN}║${NC}  Графіки будуть відображати реальні дані."
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${YELLOW}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${YELLOW}║${NC}  ⚠️ SOME DATA MISSING"
    echo -e "${YELLOW}╚════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
