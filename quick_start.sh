#!/bin/bash
# GenTrust Quick Start - запуск всієї системи за секунди

set -e

echo "🧹 Cleaning old processes..."
pkill -9 -f "ts-node src/index|expo start|vite" 2>/dev/null || true
sleep 2

echo "📍 Getting IP address..."
IP=$(ifconfig en0 | grep "inet " | awk '{print $2}')
echo "   IP: $IP"

echo "🚀 Starting Backend (port 3000)..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npx ts-node src/index.ts > server.log 2>&1 &
BACKEND_PID=$!
sleep 8

# Check if backend started
if ! lsof -nP -iTCP:3000 -sTCP:LISTEN > /dev/null 2>&1; then
    echo "❌ Backend failed to start! Check server.log"
    tail -20 server.log
    exit 1
fi
echo "✅ Backend running (PID: $BACKEND_PID)"

echo "🎨 Starting Admin Panel (port 5173)..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE/admin-panel
npm run dev > ../admin_panel.log 2>&1 &
echo "✅ Admin Panel starting..."

echo "👥 Starting Staff Panel (port 5174)..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE/staff-panel
npm run dev > ../staff_panel.log 2>&1 &
echo "✅ Staff Panel starting..."

sleep 2

echo "📱 Starting Expo (port 8082)..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-school
npx expo start --port 8082 --lan --clear > ../expo.log 2>&1 &
EXPO_PID=$!

echo ""
echo "⏳ Waiting for Expo to build..."
sleep 8

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ СИСТЕМА ЗАПУЩЕНА!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Порти:"
echo "   Backend:     http://$IP:3000"
echo "   Admin:       http://localhost:5173"
echo "   Staff:       http://localhost:5174"
echo "   Expo Mobile: exp://$IP:8082"
echo ""
echo "📱 На телефоні відкрийте Expo Go і введіть:"
echo "   exp://$IP:8082"
echo ""
echo "📝 Логи:"
echo "   Backend:  tail -f server.log"
echo "   Expo:     tail -f expo.log"
echo ""
echo "🛑 Зупинити все: ./stop.sh"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
