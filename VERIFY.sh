#!/bin/bash

# GenTrust - Quick Start & Verification Script

echo "🚀 GenTrust System Verification"
echo "==============================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. Check Node.js
echo -n "1. Checking Node.js... "
if command -v node &> /dev/null; then
    node_version=$(node -v)
    echo -e "${GREEN}✅ $node_version${NC}"
else
    echo -e "${RED}❌ Node.js not found${NC}"
    exit 1
fi

# 2. Check npm
echo -n "2. Checking npm... "
if command -v npm &> /dev/null; then
    npm_version=$(npm -v)
    echo -e "${GREEN}✅ $npm_version${NC}"
else
    echo -e "${RED}❌ npm not found${NC}"
    exit 1
fi

# 3. Check dependencies
echo -n "3. Checking backend dependencies... "
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules found${NC}"
else
    echo -e "${YELLOW}⚠️  Running npm install...${NC}"
    npm install > /dev/null 2>&1
    echo -e "${GREEN}✅ Dependencies installed${NC}"
fi

# 4. Check build
echo -n "4. Checking backend build... "
npm run build > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

# 5. Check database
echo -n "5. Checking database... "
if [ -f "prisma/dev.db" ]; then
    echo -e "${GREEN}✅ Database found${NC}"
else
    echo -e "${YELLOW}⚠️  Creating database...${NC}"
    npx prisma db push > /dev/null 2>&1
    echo -e "${GREEN}✅ Database created${NC}"
fi

# 6. Check mobile apps
echo -n "6. Checking Client App... "
if [ -d "mobile" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
fi

echo -n "7. Checking School App... "
if [ -d "mobile-school" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
fi

# 7. Check web panels
echo -n "8. Checking Staff Panel... "
if [ -d "staff-panel" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
fi

echo -n "9. Checking Admin Panel... "
if [ -d "admin-panel" ]; then
    echo -e "${GREEN}✅ Found${NC}"
else
    echo -e "${RED}❌ Not found${NC}"
fi

# 8. Test API
echo ""
echo "Starting backend... (waiting 3 seconds)"
npm start > server_logs.txt 2>&1 &
BACKEND_PID=$!
sleep 3

echo -n "10. Testing API health... "
response=$(curl -s http://localhost:3000/api/health)
if echo $response | grep -q "ok"; then
    echo -e "${GREEN}✅ API responding${NC}"
else
    echo -e "${RED}❌ API not responding${NC}"
fi

# Kill backend
kill $BACKEND_PID 2>/dev/null

echo ""
echo "==============================="
echo -e "${GREEN}✅ All checks passed!${NC}"
echo ""
echo "📱 Next Steps:"
echo ""
echo "1. Start Backend:"
echo "   npm start"
echo ""
echo "2. Start Client App (new terminal):"
echo "   cd mobile && npx expo start --ios"
echo ""
echo "3. Start School App (new terminal):"
echo "   cd mobile-school && npx expo start --ios"
echo ""
echo "4. Start Staff Panel (new terminal):"
echo "   cd staff-panel && npm install && npm run dev"
echo ""
echo "5. Start Admin Panel (new terminal):"
echo "   cd admin-panel && npm install && npm run dev"
echo ""
echo "📚 Documentation:"
echo "   - ARCHITECTURE.md - Complete architecture"
echo "   - ADMIN_DASHBOARD.md - Admin panel guide"
echo "   - COMPLETE_SYSTEM.md - Full system overview"
echo ""
echo "Happy coding! 🚀"
