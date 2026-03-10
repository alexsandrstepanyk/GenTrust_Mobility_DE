#!/bin/bash

################################################################################
# GENTRUST MOBILITY v6.0.0 - STARTUP SCRIPT (Full Version)
# Зберігає ВСЮ логіку з start.sh + v6.0.0 оптимізації
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

# Логіка з start.sh - перевірка портів в діапазоні 3000-9000
check_port_in_range() {
    local port=$1
    if [ $port -lt 3000 ] || [ $port -gt 9000 ]; then
        echo -e "${RED}❌ ПОРТ $port поза діапазоном 3000-9000!${NC}"
        return 1
    fi
    return 0
}

# Функція запуску з start.sh
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
            echo -e "${CYAN}🔄 СПРОБА $retry: Запускаю $service_name на порту $port...${NC}"
        else
            echo -e "${CYAN}Запускаю $service_name на порту $port...${NC}"
        fi

        # 🔒 ПЕРЕВІРКА: Чи зайнятий порт
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

        # Запускаємо сервіс
        cd "$dir" || return 1
        eval "$command" > "$log_file" 2>&1 &
        local pid=$!

        # Чек на стабілізацію
        if [[ "$service_name" == *"Backend"* ]]; then
            sleep 10
        else
            sleep 5
        fi

        # Перевірка що процес живий
        if ! kill -0 $pid 2>/dev/null; then
            echo -e "${RED}$service_name не запустився (PID: $pid)${NC}"
            echo "Логи:"
            tail -n 10 "$log_file"
            retry=$((retry + 1))
            continue
        fi

        # Перевірка порту
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

# Header
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  GENTRUST MOBILITY v6.0.0 - STARTUP"
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
    echo -e "${YELLOW}Please edit .env and set JWT_SECRET (at least 32 characters)${NC}"
    echo -e "${YELLOW}Generate: openssl rand -base64 32${NC}"
    exit 1
fi
echo -e "${GREEN}✅ .env validated${NC}\n"

# Перевірка Redis
echo -e "${YELLOW}→${NC} Checking Redis..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis is running${NC}"
    else
        echo -e "${YELLOW}⚠️  Redis is installed but not running${NC}"
        echo -e "${YELLOW}   Start: brew services start redis${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  Redis is not installed${NC}"
    echo -e "${YELLOW}   Install: brew install redis${NC}"
fi
echo ""

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

# Запуск серверів (порядок як в start.sh)
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  STARTING SERVICES (v6.0.0 with optimizations)"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# 1. Backend API (ЗАВЖДИ ПЕРШИМ)
echo -e "${CYAN}[1/2] Backend API (v6.0.0)${NC}"
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

# 2. Outbox Worker (вже запускається в api-server.ts)
echo -e "${GREEN}✅ Outbox Worker started (inside api-server)${NC}\n"

# Фінальний статус
echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}  ALL SERVICES STARTED SUCCESSFULLY"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${CYAN}📊 Services:${NC}"
echo -e "   🌐 Backend API v6:  ${GREEN}http://localhost:3000${NC}"
echo -e "   🏥 Health check:    ${GREEN}http://localhost:3000/health${NC}"
echo -e "   📋 Logs:            ${GREEN}/tmp/BackendAPIv6.log${NC}"
echo ""

echo -e "${YELLOW}🎯 v6.0.0 Features:${NC}"
echo -e "   ✅ Outbox Pattern (guaranteed delivery)"
echo -e "   ✅ Redis Cache (if available)"
echo -e "   ✅ Security (Helmet, Rate Limit, CORS)"
echo -e "   ✅ Structured Logging"
echo -e "   ✅ Health Checks"
echo -e "   ✅ Object Storage (Cloudinary)"
echo ""

# Відкрити health check в браузері
if command -v open &> /dev/null; then
    sleep 2
    open http://localhost:3000/health
fi
