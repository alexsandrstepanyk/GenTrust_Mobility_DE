#!/bin/bash

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 GENTRUST MOBILITY - ЗАПУСК ВСІХ СЕРВІСІВ          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Звільнення портів
echo -e "${YELLOW}🧹 Звільнення портів...${NC}"
pkill -9 -f "nodemon" 2>/dev/null
pkill -9 -f "expo" 2>/dev/null
pkill -9 -f "vite" 2>/dev/null
sleep 2

# 1. Backend
echo -e "${YELLOW}1️⃣  Backend API (port 3000)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npm run dev > server_logs.txt 2>&1 &
BACKEND_PID=$!
sleep 5
echo -e "${GREEN}   ✅ Backend (PID: $BACKEND_PID)${NC}"

# 2. Staff Panel
echo -e "${YELLOW}2️⃣  Staff Panel (port 5173)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE/staff-panel
npm run dev > staff_panel.log 2>&1 &
STAFF_PID=$!
sleep 3
echo -e "${GREEN}   ✅ Staff Panel (PID: $STAFF_PID)${NC}"

# 3. Admin Panel
echo -e "${YELLOW}3️⃣  Admin Panel (port 5174)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE/admin-panel
npm run dev > admin_panel.log 2>&1 &
ADMIN_PID=$!
sleep 3
echo -e "${GREEN}   ✅ Admin Panel (PID: $ADMIN_PID)${NC}"

# 4. Mobile Client
echo -e "${YELLOW}4️⃣  Mobile Client (port 8081)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile/gentrustmobility
npx expo start --port 8081 --go > mobile_client.log 2>&1 &
CLIENT_PID=$!
sleep 3
echo -e "${GREEN}   ✅ Mobile Client (PID: $CLIENT_PID)${NC}"

# 5. Mobile School
echo -e "${YELLOW}5️⃣  Mobile School (port 8082)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-school
npx expo start --port 8082 --go > mobile_school.log 2>&1 &
SCHOOL_PID=$!
sleep 3
echo -e "${GREEN}   ✅ Mobile School (PID: $SCHOOL_PID)${NC}"

# Отримання IP
IP_ADDRESS=$(ipconfig getifaddr en0 2>/dev/null || echo "localhost")

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ ВСІ СЕРВІСИ ЗАПУЩЕНІ                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🌐 ПОСИЛАННЯ:${NC}"
echo -e "   Backend API:      ${BLUE}http://localhost:3000/api${NC}"
echo -e "   Staff Panel:      ${BLUE}http://localhost:5173${NC}"
echo -e "   Admin Panel:      ${BLUE}http://localhost:5174${NC}"
echo -e "   Mobile Client:    ${BLUE}exp://${IP_ADDRESS}:8081${NC}"
echo -e "   Mobile School:    ${BLUE}exp://${IP_ADDRESS}:8082${NC}"
echo ""
echo -e "${GREEN}📊 PID процесів:${NC}"
echo -e "   Backend: $BACKEND_PID"
echo -e "   Staff Panel: $STAFF_PID"
echo -e "   Admin Panel: $ADMIN_PID"
echo -e "   Mobile Client: $CLIENT_PID"
echo -e "   Mobile School: $SCHOOL_PID"
echo ""
echo -e "${YELLOW}💡 Для зупинки: pkill -f 'nodemon|expo|vite'${NC}"
echo ""
