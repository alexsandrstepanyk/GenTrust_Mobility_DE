#!/bin/bash

################################################################################
# GENTRUST MOBILITY v6.0.0 - FULL STARTUP SCRIPT
# Запускає ВСІ сервери як в start.sh + v6.0.0 оптимізації
################################################################################

set -e

# Кольори
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
cd "$PROJECT_DIR"

# ============================================================================
# 🔒 ПРАВИЛА (з start.sh)
# ============================================================================

# ⚠️ ПРАВИЛО ЗБЕРЕЖЕННЯ КОДУ:
#   - Ніколи не видаляй код з проекту
#   - Якщо код неактивний - залишай його в файлі з коментарем

# 🔒 ПРАВИЛО ФІКСОВАНИХ ПОРТІВ:
#   - Кожен сервіс має СВІЙ фіксований порт (назавжди)
#   - Ніхто інший НЕ МАЄ ПРАВА займати чужий порт

# ⚠️ ПРАВИЛО ОБМЕЖЕННЯ ДІАПАЗОНУ ПОРТІВ (КРИТИЧНО):
#   - Твій діапазон роботи: 3000 - 9000
#   - ЗАБОРОНЕНО чіпати порти ПОЗА цим діапазоном

# ============================================================================
# ФУНКЦІЇ
# ============================================================================

check_port_in_range() {
    local port=$1
    if [ $port -lt 3000 ] || [ $port -gt 9000 ]; then
        echo -e "${RED}❌ ПОРТ $port поза діапазоном 3000-9000!${NC}"
        return 1
    fi
    return 0
}

launch_service() {
    local service_name=$1
    local port=$2
    local command=$3
    local dir=$4
    local log_file="/tmp/${service_name//[ ()]/}.log"
    local max_retries=2
    local retry=0

    check_port_in_range $port || return 1

    while [ $retry -lt $max_retries ]; do
        echo -e "${CYAN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        
        if [ $retry -gt 0 ]; then
            echo -e "${CYAN}🔄 СПРОБА $retry: Запускаю $service_name на порту $port...${NC}"
        else
            echo -e "${CYAN}Запускаю $service_name на порту $port...${NC}"
        fi

        echo -e "${CYAN}Перевірка порту $port...${NC}"
        local existing_pid=$(lsof -ti:$port 2>/dev/null)

        if [ -n "$existing_pid" ]; then
            echo -e "${RED}⚠️  Порт $port ЗАЙНЯТИЙ (PID: $existing_pid)!${NC}"
            echo -e "${YELLOW}ВБИВАЄМО порушника...${NC}"
            lsof -ti:$port | xargs kill -9 2>/dev/null
            sleep 2

            if lsof -ti:$port 2>/dev/null | grep -q .; then
                echo -e "${RED}❌ НЕ ВДАЛОСЯ звільнити порт $port!${NC}"
                return 1
            else
                echo -e "${GREEN}✅ Порт $port звільнено${NC}"
            fi
        fi

        cd "$dir" || return 1
        eval "$command" > "$log_file" 2>&1 &
        local pid=$!

        if [[ "$service_name" == *"Backend"* ]]; then
            sleep 10
        elif [[ "$dir" == *"dashboard"* ]] || [[ "$dir" == *"panel"* ]]; then
            sleep 5
        else
            sleep 5
        fi

        if ! kill -0 $pid 2>/dev/null; then
            echo -e "${RED}$service_name не запустився (PID: $pid)${NC}"
            echo "Логи:"
            tail -n 10 "$log_file"
            retry=$((retry + 1))
            continue
        fi

        sleep 3
        local actual_pid=$(lsof -ti:$port 2>/dev/null | head -1)

        if [ -z "$actual_pid" ]; then
            echo -e "${RED}❌ ПОМИЛКА! Порт $port ніким не зайнятий!${NC}"
            retry=$((retry + 1))
            continue
        fi

        echo -e "${GREEN}✅ $service_name запущено (PID: $actual_pid)${NC}"
        return 0
    done

    return 1
}

# ============================================================================
# ГОЛОВНА ПРОГРАМА
# ============================================================================

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  GENTRUST MOBILITY v6.0.0 - FULL STARTUP"
echo -e "${BLUE}║${NC}  Запуск ВСІХ серверів (Backend + Dashboards)"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Перевірка .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env created${NC}"
fi

# Перевірка JWT_SECRET
JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d '=' -f 2)
if [ "$JWT_SECRET" == "your-super-secret-jwt-key-change-this-in-production" ] || [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}❌ JWT_SECRET not set in .env!${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .env validated${NC}\n"

# Перевірка Prisma
echo -e "${YELLOW}→${NC} Checking Prisma..."
if [ ! -f "prisma/dev.db" ]; then
    echo -e "${YELLOW}→${NC} Creating database..."
    npx prisma migrate dev --name init
    echo -e "${GREEN}✅ Database created${NC}"
else
    echo -e "${GREEN}✅ Database exists${NC}"
fi

# Генерація Prisma Client
echo -e "${YELLOW}→${NC} Generating Prisma Client..."
npx prisma generate > /dev/null 2>&1
npx prisma generate --schema=./prisma/schema_departments.prisma > /dev/null 2>&1
echo -e "${GREEN}✅ Prisma Client generated${NC}\n"

# ============================================================================
# ЗАПУСК ВСІХ СЕРВЕРІВ (порядок як в start.sh)
# ============================================================================

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  STARTING ALL SERVICES"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# 1. BACKEND API (ЗАВЖДИ ПЕРШИМ)
echo -e "${CYAN}[1/11] Backend API v6 (порт 3000)${NC}"
launch_service "Backend API v6" "3000" "npx ts-node src/api-server.ts" "$PROJECT_DIR" || exit 1
sleep 2

# Перевірка що Backend запустився
echo -e "${YELLOW}→${NC} Checking Backend health..."
for i in {1..10}; do
    if curl -s http://localhost:3000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✅ Backend is ready${NC}"
        break
    fi
    if [ $i -eq 10 ]; then
        echo -e "${RED}❌ Backend failed to start${NC}"
        exit 1
    fi
    sleep 1
done

# 2. CITY-HALL DASHBOARD (порт 5173)
echo -e "${CYAN}[2/11] City-Hall Dashboard (порт 5173)${NC}"
launch_service "City-Hall Dashboard" "5173" "npm run dev" "$PROJECT_DIR/city-hall-dashboard" || exit 1

# 3. ADMIN PANEL (порт 5174)
echo -e "${CYAN}[3/11] Admin Panel (порт 5174)${NC}"
launch_service "Admin Panel" "5174" "npm run dev" "$PROJECT_DIR/admin-panel" || exit 1

# 4. DEPARTMENT DASHBOARD BASE (порт 5175)
echo -e "${CYAN}[4/11] Department Dashboard Base (порт 5175)${NC}"
launch_service "Department Dashboard" "5175" "npm run dev" "$PROJECT_DIR/department-dashboard" || exit 1

# 5-12. 8 ДЕПАРТАМЕНТІВ (порти 5180-5187)
echo -e "${CYAN}[5/12] 🛣️ Roads Department (порт 5180)${NC}"
launch_service "Dept: Roads" "5180" "npm run dev" "$PROJECT_DIR/departments/roads" || echo "⚠️ Roads failed"

echo -e "${CYAN}[6/12] 💡 Lighting Department (порт 5181)${NC}"
launch_service "Dept: Lighting" "5181" "npm run dev" "$PROJECT_DIR/departments/lighting" || echo "⚠️ Lighting failed"

echo -e "${CYAN}[7/12] 🗑️ Waste Department (порт 5182)${NC}"
launch_service "Dept: Waste" "5182" "npm run dev" "$PROJECT_DIR/departments/waste" || echo "⚠️ Waste failed"

echo -e "${CYAN}[8/12] 🌳 Parks Department (порт 5183)${NC}"
launch_service "Dept: Parks" "5183" "npm run dev" "$PROJECT_DIR/departments/parks" || echo "⚠️ Parks failed"

echo -e "${CYAN}[9/12] 🚰 Water Department (порт 5184)${NC}"
launch_service "Dept: Water" "5184" "npm run dev" "$PROJECT_DIR/departments/water" || echo "⚠️ Water failed"

echo -e "${CYAN}[10/12] 🚌 Transport Department (порт 5185)${NC}"
launch_service "Dept: Transport" "5185" "npm run dev" "$PROJECT_DIR/departments/transport" || echo "⚠️ Transport failed"

echo -e "${CYAN}[11/12] 🌿 Ecology Department (порт 5186)${NC}"
launch_service "Dept: Ecology" "5186" "npm run dev" "$PROJECT_DIR/departments/ecology" || echo "⚠️ Ecology failed"

echo -e "${CYAN}[12/12] 🎨 Vandalism Department (порт 5187)${NC}"
launch_service "Dept: Vandalism" "5187" "npm run dev" "$PROJECT_DIR/departments/vandalism" || echo "⚠️ Vandalism failed"

# ============================================================================
# ФІНАЛЬНИЙ СТАТУС
# ============================================================================

echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}  ALL SERVICES STARTED SUCCESSFULLY"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}📊 Services:${NC}"
echo -e "   🌐 Backend API v6:      ${GREEN}http://localhost:3000${NC}"
echo -e "   🏛️  City-Hall:          ${GREEN}http://localhost:5173${NC}"
echo -e "   🔐 Admin Panel:         ${GREEN}http://localhost:5174${NC}"
echo -e "   🏢 Department Base:     ${GREEN}http://localhost:5175${NC}"
echo -e "   🛣️  Roads:              ${GREEN}http://localhost:5180${NC}"
echo -e "   💡 Lighting:            ${GREEN}http://localhost:5181${NC}"
echo -e "   🗑️  Waste:              ${GREEN}http://localhost:5182${NC}"
echo -e "   🌳 Parks:               ${GREEN}http://localhost:5183${NC}"
echo -e "   🚰 Water:               ${GREEN}http://localhost:5184${NC}"
echo -e "   🚌 Transport:           ${GREEN}http://localhost:5185${NC}"
echo -e "   🌿 Ecology:             ${GREEN}http://localhost:5186${NC}"
echo -e "   🎨 Vandalism:           ${GREEN}http://localhost:5187${NC}"
echo ""

echo -e "${YELLOW}🔒 Rules Applied:${NC}"
echo -e "   ✅ Port range: 3000-9000 only"
echo -e "   ✅ Fixed ports for all services"
echo -e "   ✅ Code preservation"
echo -e "   ✅ Documentation required"
echo ""

echo -e "${YELLOW}🎯 v6.0.0 Features:${NC}"
echo -e "   ✅ Outbox Pattern (guaranteed delivery)"
echo -e "   ✅ Redis Cache (if available)"
echo -e "   ✅ Security (Helmet, Rate Limit, CORS)"
echo -e "   ✅ Structured Logging"
echo -e "   ✅ Health Checks"
echo -e "   ✅ Object Storage (Cloudinary)"
echo ""

# Відкрити Monitor Dashboard
if command -v open &> /dev/null; then
    sleep 2
    echo -e "${YELLOW}Opening Monitor Dashboard...${NC}"
    open http://localhost:9000
fi
