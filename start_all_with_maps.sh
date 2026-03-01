#!/bin/bash

echo "🚀 Запуск GenTrust Mobility з картами (Leaflet)..."

# Завершити старі процеси
pkill -f "vite" 2>/dev/null
pkill -f "nodemon" 2>/dev/null
sleep 2

# Backend (порт 3000)
echo "📡 Запуск Backend API на http://localhost:3000..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE
npm run dev &
BACKEND_PID=$!

sleep 5

# Dashboard з картами (порт 5173)
echo "🎨 Запуск City Hall Dashboard з картами на http://localhost:5173..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE/city-hall-dashboard
npm run dev &
DASHBOARD_PID=$!

sleep 3

# Mobile (порт 8081)
echo "📱 Запуск Mobile School на http://localhost:8081..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-school
npx expo start --port 8081 &
MOBILE_PID=$!

echo ""
echo "✅ Все запущено!"
echo ""
echo "🌐 Backend API:        http://localhost:3000"
echo "🎨 City Hall Dashboard: http://localhost:5173 (Leaflet Maps)"
echo "📱 Mobile School:       http://localhost:8081"
echo ""
echo "💡 Для зупинки всіх сервісів: pkill -f 'vite\|nodemon\|expo'"
echo ""

# Чекати для завершення
wait
