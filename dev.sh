#!/bin/bash
cd "$(dirname "$0")"
echo "🚀 Запускаю GenTrust..."

# Kill old processes
pkill -f "node dist" 2>/dev/null || true
pkill -f "npm run dev" 2>/dev/null || true
pkill -f "expo start" 2>/dev/null || true
sleep 1

# Build TypeScript
echo "📦 Компілюю TypeScript..."
npm run build > /dev/null 2>&1

# Start bots (with npm start - production mode)
echo "🤖 Запускаю Telegram боти..."
npm start > .bot.log 2>&1 &
sleep 3

# Start mobile frontend
echo "📱 Запускаю Expo..."
cd mobile && npx expo start --ios > ../.frontend.log 2>&1 &
sleep 2
cd ..

# Open Xcode
open mobile/ios/mobile.xcworkspace 2>/dev/null || true

echo ""
echo "✅ ВСЕ ЗАПУЩЕНО!"
echo ""
echo "📊 Доступні сервіси:"
echo "  • Telegram боти (Master, Scout, City Hall, Quest Provider, Municipal)"
echo "  • Backend API на http://localhost:3000"
echo "  • Expo на http://localhost:8081"
echo ""
echo "💡 Натисніть 'i' в терміналі щоб запустити на iOS Simulator"
echo ""
