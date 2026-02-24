#!/bin/bash

# Кольори для виводу
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 GENTRUST MOBILITY - АВТОЗАПУСК СИСТЕМИ           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Порти які потрібно перевірити
PORTS=(3000 5173 5174 8081 8082)

echo -e "${YELLOW}📡 Перевірка портів...${NC}"
echo ""

# Функція для перевірки та звільнення порту
check_and_free_port() {
    local port=$1
    local process=$(lsof -ti:$port)
    
    if [ ! -z "$process" ]; then
        echo -e "${RED}❌ Порт $port зайнятий (PID: $process)${NC}"
        echo -e "${YELLOW}   Зупиняю процес...${NC}"
        kill -9 $process 2>/dev/null
        sleep 1
        echo -e "${GREEN}   ✅ Порт $port звільнено${NC}"
    else
        echo -e "${GREEN}✅ Порт $port вільний${NC}"
    fi
}

# Перевірка всіх портів
for port in "${PORTS[@]}"; do
    check_and_free_port $port
done

echo ""
echo -e "${YELLOW}🧹 Зупиняю старі процеси Expo...${NC}"
pkill -f "expo start" 2>/dev/null
sleep 2

echo ""
echo -e "${YELLOW}🔄 Очищення кешів...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility/mobile && rm -rf .expo 2>/dev/null
cd /Users/apple/Desktop/GenTrust_Mobility/mobile-school && rm -rf .expo 2>/dev/null

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 ЗАПУСК СЕРВІСІВ                                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Запуск Backend
echo -e "${YELLOW}1️⃣  Запуск Backend API (port 3000)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npm run dev > server_logs.txt 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}   ✅ Backend запущено (PID: $BACKEND_PID)${NC}"
sleep 5

# Перевірка здоров'я backend
HEALTH_CHECK=$(curl -s http://localhost:3000/api/health 2>&1)
if [[ $HEALTH_CHECK == *"ok"* ]] || [[ $HEALTH_CHECK == *"healthy"* ]]; then
    echo -e "${GREEN}   ✅ Backend відповідає${NC}"
else
    echo -e "${RED}   ⚠️  Backend не відповідає, але продовжуємо...${NC}"
fi

# 2. Запуск Staff Panel
echo ""
echo -e "${YELLOW}2️⃣  Запуск Staff Panel (port 5173)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE/staff-panel
npm run dev > /dev/null 2>&1 &
STAFF_PID=$!
echo -e "${GREEN}   ✅ Staff Panel запущено (PID: $STAFF_PID)${NC}"
sleep 2

# 3. Запуск Admin Panel
echo ""
echo -e "${YELLOW}3️⃣  Запуск Admin Panel (port 5174)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE/admin-panel
npm run dev > /dev/null 2>&1 &
ADMIN_PID=$!
echo -e "${GREEN}   ✅ Admin Panel запущено (PID: $ADMIN_PID)${NC}"
sleep 2

# 4. Запуск Mobile Client
echo ""
echo -e "${YELLOW}4️⃣  Запуск Mobile Client (port 8081)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile
npx expo start --port 8081 --go > /dev/null 2>&1 &
CLIENT_PID=$!
echo -e "${GREEN}   ✅ Mobile Client запущено (PID: $CLIENT_PID)${NC}"
sleep 4

# 5. Запуск Mobile School
echo ""
echo -e "${YELLOW}5️⃣  Запуск Mobile School (port 8082)...${NC}"
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-school
npx expo start --port 8082 --go > /dev/null 2>&1 &
SCHOOL_PID=$!
echo -e "${GREEN}   ✅ Mobile School запущено (PID: $SCHOOL_PID)${NC}"
sleep 4

# Отримання IP адреси
IP_ADDRESS=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")

# 6. Відкриття на симуляторах
echo ""
echo -e "${YELLOW}📱 Відкриття додатків на симуляторах...${NC}"

# iPhone 16e для Client
xcrun simctl openurl booted exp://$IP_ADDRESS:8081 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ Client відкрито на iPhone 16e${NC}"
else
    echo -e "${RED}   ⚠️  Не вдалося відкрити Client (симулятор не запущений?)${NC}"
fi

sleep 2

# iPhone 16 Pro для School
xcrun simctl openurl 4ED9C6C5-4AD2-4F7F-B49F-D0C65B627C0A exp://$IP_ADDRESS:8082 2>/dev/null
if [ $? -eq 0 ]; then
    echo -e "${GREEN}   ✅ School відкрито на iPhone 16 Pro${NC}"
else
    echo -e "${RED}   ⚠️  Не вдалося відкрити School (симулятор не запущений?)${NC}"
fi

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ СИСТЕМА ЗАПУЩЕНА                                  ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}🌐 ПОСИЛАННЯ:${NC}"
echo -e "   Backend API:      ${BLUE}http://localhost:3000/api${NC}"
echo -e "   Staff Panel:      ${BLUE}http://localhost:5173${NC}"
echo -e "   Admin Panel:      ${BLUE}http://localhost:5174${NC}"
echo -e "   Mobile Client:    ${BLUE}exp://$IP_ADDRESS:8081${NC}"
echo -e "   Mobile School:    ${BLUE}exp://$IP_ADDRESS:8082${NC}"
echo ""
echo -e "${GREEN}🔐 ТЕСТОВІ ДАНІ:${NC}"
echo -e "   Email:    ${YELLOW}admin${NC}"
echo -e "   Password: ${YELLOW}admin${NC}"
echo ""
echo -e "${GREEN}📊 PID процесів:${NC}"
echo -e "   Backend: $BACKEND_PID"
echo -e "   Staff Panel: $STAFF_PID"
echo -e "   Admin Panel: $ADMIN_PID"
echo -e "   Mobile Client: $CLIENT_PID"
echo -e "   Mobile School: $SCHOOL_PID"
echo ""
echo -e "${YELLOW}💡 Для зупинки всіх сервісів запустіть:${NC}"
echo -e "   ${BLUE}./stop.sh${NC} або ${BLUE}pkill -f 'expo start' && kill $BACKEND_PID $STAFF_PID $ADMIN_PID${NC}"
echo ""
echo -e "${GREEN}✨ Готово до презентації!${NC}"
echo ""
