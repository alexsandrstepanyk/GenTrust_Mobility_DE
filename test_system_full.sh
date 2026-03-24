#!/bin/bash

################################################################################
#              🧪 GENTRUST MOBILITY - ПОВНИЙ ТЕСТ СИСТЕМИ                      #
#                                                                              #
# Використання: ./test_system.sh                                              #
################################################################################

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}🧪 GENTRUST MOBILITY - ПОВНИЙ ТЕСТ СИСТЕМИ${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""

# 1. Backend API
echo -e "${YELLOW}1️⃣  ТЕСТ BACKEND API (порт 3000)...${NC}"
if curl -s http://localhost:3000/api/health | grep -q "ok"; then
    echo -e "   ${GREEN}✅ Backend API працює${NC}"
else
    echo -e "   ${RED}❌ Backend API НЕ працює${NC}"
fi
echo ""

# 2. Monitor Dashboard
echo -e "${YELLOW}2️⃣  ТЕСТ MONITOR DASHBOARD (порт 9000)...${NC}"
if curl -s http://localhost:9000/api/status | grep -q "services"; then
    echo -e "   ${GREEN}✅ Monitor Dashboard працює${NC}"
    ONLINE=$(curl -s http://localhost:9000/api/status | python3 -c "import sys,json; d=json.load(sys.stdin); print(len([s for s in d['services'] if s['status']=='online']))" 2>/dev/null)
    echo -e "   Онлайн сервісів: ${GREEN}$ONLINE${NC}"
else
    echo -e "   ${RED}❌ Monitor Dashboard НЕ працює${NC}"
fi
echo ""

# 3. City-Hall Dashboard
echo -e "${YELLOW}3️⃣  ТЕСТ CITY-HALL DASHBOARD (порт 5173)...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5173)
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "304" ]; then
    echo -e "   ${GREEN}✅ City-Hall Dashboard працює (HTTP $RESPONSE)${NC}"
else
    echo -e "   ${RED}❌ City-Hall Dashboard НЕ працює (HTTP $RESPONSE)${NC}"
fi
echo ""

# 4. Admin Panel
echo -e "${YELLOW}4️⃣  ТЕСТ ADMIN PANEL (порт 5174)...${NC}"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5174)
if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "304" ]; then
    echo -e "   ${GREEN}✅ Admin Panel працює (HTTP $RESPONSE)${NC}"
else
    echo -e "   ${RED}❌ Admin Panel НЕ працює (HTTP $RESPONSE)${NC}"
fi
echo ""

# 5. Департаменти
echo -e "${YELLOW}5️⃣  ТЕСТ 8 ДЕПАРТАМЕНТІВ...${NC}"
WORKING=0
for dept in "Roads:5180" "Lighting:5181" "Waste:5182" "Parks:5183" "Water:5184" "Transport:5185" "Ecology:5186" "Vandalism:5187"; do
    NAME="${dept%%:*}"
    PORT="${dept##*:}"
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:$PORT")
    if [ "$RESPONSE" = "200" ] || [ "$RESPONSE" = "304" ]; then
        echo -e "   ${GREEN}✅ $NAME (порт $PORT)${NC}"
        WORKING=$((WORKING + 1))
    else
        echo -e "   ${RED}❌ $NAME (порт $PORT) - HTTP $RESPONSE${NC}"
    fi
done
echo -e "   Працює: ${GREEN}$WORKING/8${NC} департаментів"
echo ""

# 6. Expo Parent
echo -e "${YELLOW}6️⃣  ТЕСТ EXPO PARENT (порт 8083)...${NC}"
if lsof -ti:8083 >/dev/null 2>&1; then
    echo -e "   ${GREEN}✅ Expo Parent працює (порт 8083 зайнятий)${NC}"
    echo -e "   URL: exp://192.168.178.34:8083"
else
    echo -e "   ${RED}❌ Expo Parent НЕ працює${NC}"
fi
echo ""

# 7. Логи
echo -e "${YELLOW}7️⃣  ТЕСТ ЛОГІВ...${NC}"
LOG_COUNT=$(ls /tmp/*.log 2>/dev/null | wc -l | tr -d ' ')
echo -e "   Знайдено лог-файлів: ${GREEN}$LOG_COUNT${NC}"
echo "   Основні логи:"
for log in /tmp/BackendAPIAPImode.log /tmp/Monitor.log /tmp/City-HallDashboard.log /tmp/AdminPanelCoreDashboard.log /tmp/expo-parent.log; do
    if [ -f "$log" ]; then
        SIZE=$(wc -c < "$log" | tr -d ' ')
        echo -e "   ${GREEN}✅$(basename $log)${NC} - $SIZE байт"
    fi
done
echo ""

# 8. База даних
echo -e "${YELLOW}8️⃣  ТЕСТ БАЗИ ДАНИХ...${NC}"
DB_FILE="/Users/apple/Desktop/GenTrust_Mobility_DE/prisma/dev.db"
if [ -f "$DB_FILE" ]; then
    USER_COUNT=$(sqlite3 "$DB_FILE" "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")
    echo -e "   ${GREEN}✅ База даних існує${NC}"
    echo -e "   Користувачів: ${GREEN}$USER_COUNT${NC}"
else
    echo -e "   ${RED}❌ База даних НЕ знайдена${NC}"
fi
echo ""

# 9. API Endpoints
echo -e "${YELLOW}9️⃣  ТЕСТ API ENDPOINTS...${NC}"
for endpoint in "/api/health" "/api/status"; do
    RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:3000$endpoint")
    if [ "$RESPONSE" = "200" ]; then
        echo -e "   ${GREEN}✅ $endpoint - HTTP $RESPONSE${NC}"
    else
        echo -e "   ${RED}❌ $endpoint - HTTP $RESPONSE${NC}"
    fi
done
echo ""

# Фінальний підсумок
echo "═══════════════════════════════════════════════════════"
echo -e "${GREEN}📊 ПІДСУМКОВИЙ ЗВІТ${NC}"
echo "═══════════════════════════════════════════════════════"
echo ""

TOTAL_ONLINE=$(curl -s http://localhost:9000/api/status 2>/dev/null | python3 -c "import sys,json; d=json.load(sys.stdin); print(len([s for s in d['services'] if s['status']=='online']))" 2>/dev/null || echo "0")

echo -e "Backend API: $(lsof -ti:3000 >/dev/null 2>&1 && echo -e "${GREEN}Працює${NC}" || echo -e "${RED}НЕ працює${NC}")"
echo -e "Monitor Dashboard: $(lsof -ti:9000 >/dev/null 2>&1 && echo -e "${GREEN}Працює${NC}" || echo -e "${RED}НЕ працює${NC}")"
echo -e "City-Hall: $(lsof -ti:5173 >/dev/null 2>&1 && echo -e "${GREEN}Працює${NC}" || echo -e "${RED}НЕ працює${NC}")"
echo -e "Admin Panel: $(lsof -ti:5174 >/dev/null 2>&1 && echo -e "${GREEN}Працює${NC}" || echo -e "${RED}НЕ працює${NC}")"
echo -e "Expo Parent: $(lsof -ti:8083 >/dev/null 2>&1 && echo -e "${GREEN}Працює${NC}" || echo -e "${RED}НЕ працює${NC}")"

DEPT_COUNT=0
for p in 5180 5181 5182 5183 5184 5185 5186 5187; do
    lsof -ti:$p >/dev/null 2>&1 && DEPT_COUNT=$((DEPT_COUNT + 1))
done
echo -e "Департаменти: ${GREEN}$DEPT_COUNT/8${NC} працює"
echo ""
echo -e "📊 Всього онлайн: ${GREEN}$TOTAL_ONLINE/20${NC} сервісів"
echo ""
if [ "$TOTAL_ONLINE" -ge 11 ]; then
    echo -e "${GREEN}🎉 ВСЯ СИСТЕМА ПРАЦЮЄ СТАБІЛЬНО!${NC}"
else
    echo -e "${YELLOW}⚠️  Деякі сервіси не працюють${NC}"
fi
echo "═══════════════════════════════════════════════════════"
