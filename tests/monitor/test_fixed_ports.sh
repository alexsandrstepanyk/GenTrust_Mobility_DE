#!/bin/bash

################################################################################
# 🧪 TEST: Fixed Ports Logic - Перевірка фіксованих портів
# 
# 📋 ОПИС:
#   Перевіряє що кожен сервіс займає СВІЙ фіксований порт
#   Якщо порт зайнятий - показує хто займає
#
################################################################################

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo "╔════════════════════════════════════════════════════════╗"
echo "║  🔒 ПЕРЕВІРКА ФІКСОВАНИХ ПОРТІВ                        ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Список фіксованих портів
check_port() {
    local service_name=$1
    local port=$2
    
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        echo -e "${GREEN}✅ $service_name ($port): ЗАЙНЯТИЙ (PID: $pid)${NC}"
        return 0
    else
        echo -e "${RED}❌ $service_name ($port): ВІЛЬНИЙ${NC}"
        return 1
    fi
}

TOTAL=0
OCCUPIED=0

# Перевірка всіх портів
check_port "Backend API" "3000" && ((OCCUPIED++)); ((TOTAL++))
check_port "City-Hall" "5173" && ((OCCUPIED++)); ((TOTAL++))
check_port "Admin Panel" "5174" && ((OCCUPIED++)); ((TOTAL++))
check_port "Department Base" "5175" && ((OCCUPIED++)); ((TOTAL++))
check_port "Roads Dept" "5180" && ((OCCUPIED++)); ((TOTAL++))
check_port "Lighting Dept" "5181" && ((OCCUPIED++)); ((TOTAL++))
check_port "Waste Dept" "5182" && ((OCCUPIED++)); ((TOTAL++))
check_port "Parks Dept" "5183" && ((OCCUPIED++)); ((TOTAL++))
check_port "Water Dept" "5184" && ((OCCUPIED++)); ((TOTAL++))
check_port "Transport Dept" "5185" && ((OCCUPIED++)); ((TOTAL++))
check_port "Ecology Dept" "5186" && ((OCCUPIED++)); ((TOTAL++))
check_port "Vandalism Dept" "5187" && ((OCCUPIED++)); ((TOTAL++))
check_port "Monitor" "9000" && ((OCCUPIED++)); ((TOTAL++))

FREE=$((TOTAL - OCCUPIED))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "ВСЬОГО: $TOTAL | ЗАЙНЯТІ: $OCCUPIED | ВІЛЬНІ: $FREE"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $FREE -eq 0 ]; then
    echo -e "${GREEN}🎉 ВСІ ПОРТИ ЗАЙНЯТІ! ВСІ НА СВОЇХ МІСЦЯХ!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Є ВІЛЬНІ ПОРТИ! Можливо сервіси ще не запустились.${NC}"
    exit 1
fi
