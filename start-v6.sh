#!/bin/bash

################################################################################
# GENTRUST MOBILITY v6.0.0 - STARTUP SCRIPT
################################################################################

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  GENTRUST MOBILITY v6.0.0 - STARTUP"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Перевірка .env
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env not found. Creating from .env.example...${NC}"
    cp .env.example .env
    echo -e "${GREEN}✅ .env created${NC}"
    echo -e "${YELLOW}⚠️  Please edit .env and set JWT_SECRET!${NC}"
    exit 1
fi

# Перевірка JWT_SECRET
JWT_SECRET=$(grep "^JWT_SECRET=" .env | cut -d '=' -f 2)
if [ "$JWT_SECRET" == "your-super-secret-jwt-key-change-this-in-production" ] || [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}❌ JWT_SECRET not set in .env!${NC}"
    echo -e "${YELLOW}Please edit .env and set a strong JWT_SECRET (at least 32 characters)${NC}"
    echo -e "${YELLOW}Generate: openssl rand -base64 32${NC}"
    exit 1
fi

echo -e "${GREEN}✅ .env validated${NC}\n"

# Перевірка Redis
echo -e "${YELLOW}→${NC} Checking Redis..."
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo -e "${GREEN}✅ Redis is running${NC}"
        REDIS_AVAILABLE=true
    else
        echo -e "${YELLOW}⚠️  Redis is installed but not running${NC}"
        echo -e "${YELLOW}   Start: brew services start redis${NC}"
        REDIS_AVAILABLE=false
    fi
else
    echo -e "${YELLOW}⚠️  Redis is not installed${NC}"
    echo -e "${YELLOW}   Install: brew install redis${NC}"
    echo -e "${YELLOW}   Cache will be disabled${NC}"
    REDIS_AVAILABLE=false
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
echo ""

# Генерація Prisma Client
echo -e "${YELLOW}→${NC} Generating Prisma Client..."
npx prisma generate > /dev/null 2>&1
echo -e "${GREEN}✅ Prisma Client generated${NC}\n"

# Запуск сервера
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  STARTING SERVER"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

if [ "$1" == "--new" ]; then
    echo -e "${GREEN}→${NC} Starting NEW API Server (v6.0.0 with optimizations)..."
    echo -e "${GREEN}   URL: http://localhost:3000${NC}"
    echo -e "${GREEN}   Health: http://localhost:3000/health${NC}"
    echo ""
    npx ts-node src/api-server.ts
else
    echo -e "${GREEN}→${NC} Starting OLD API Server (legacy)..."
    echo -e "${GREEN}   URL: http://localhost:3000${NC}"
    echo ""
    npm run api
fi
