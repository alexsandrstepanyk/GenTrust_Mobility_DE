#!/bin/bash
# GenTrust Stop All - зупинка всіх сервісів

echo "🛑 Stopping all services..."

pkill -9 -f "ts-node src/index" 2>/dev/null && echo "✅ Backend stopped" || echo "⚠️  Backend not running"
pkill -9 -f "expo start" 2>/dev/null && echo "✅ Expo stopped" || echo "⚠️  Expo not running"
pkill -9 -f "vite.*admin-panel" 2>/dev/null && echo "✅ Admin Panel stopped" || echo "⚠️  Admin Panel not running"
pkill -9 -f "vite.*staff-panel" 2>/dev/null && echo "✅ Staff Panel stopped" || echo "⚠️  Staff Panel not running"

sleep 2

echo ""
echo "🔍 Checking ports..."
if lsof -nP -iTCP:3000 -sTCP:LISTEN > /dev/null 2>&1; then
    echo "⚠️  Port 3000 still in use"
else
    echo "✅ Port 3000 free"
fi

if lsof -nP -iTCP:8082 -sTCP:LISTEN > /dev/null 2>&1; then
    echo "⚠️  Port 8082 still in use"
else
    echo "✅ Port 8082 free"
fi

echo ""
echo "✅ All services stopped"
