#!/bin/bash

# GenTrust Mobility - Development Startup Script

echo "🚀 GenTrust Mobility Development Startup"
echo "========================================"

# Kill any existing processes
killall -9 npm node 2>/dev/null || true
sleep 1

cd /Users/apple/Desktop/GenTrust_Mobility_DE

# 1. Start Backend API (API-only mode, no bots)
echo ""
echo "📡 Starting Backend API on http://192.168.178.34:3000..."
npm run api > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo "   Backend PID: $BACKEND_PID"

# 2. Start Admin Panel
echo ""
echo "🎛️  Starting Admin Panel on http://192.168.178.34:5174..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE/admin-panel
npm run dev > /tmp/admin.log 2>&1 &
ADMIN_PID=$!
echo "   Admin PID: $ADMIN_PID"

# 3. Start Staff Panel  
echo ""
echo "👥 Starting Staff Panel on http://192.168.178.34:5173..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE/staff-panel
npm run dev > /tmp/staff.log 2>&1 &
STAFF_PID=$!
echo "   Staff PID: $STAFF_PID"

# 4. Start Expo School App
echo ""
echo "📱 Starting Expo School App on http://192.168.178.34:8082..."
cd /Users/apple/Desktop/GenTrust_Mobility_DE/mobile-school
npx expo start --tunnel > /tmp/expo.log 2>&1 &
EXPO_PID=$!
echo "   Expo PID: $EXPO_PID"

# Wait for services to start
sleep 5

echo ""
echo "✅ All services started!"
echo ""
echo "📍 SERVICE ENDPOINTS:"
echo "   Backend API:    http://192.168.178.34:3000/api/health"
echo "   Admin Panel:    http://192.168.178.34:5174"
echo "   Staff Panel:    http://192.168.178.34:5173"
echo "   Expo (Tunnel):  Check 'npx expo start' output below"
echo ""
echo "📝 To see logs:"
echo "   Backend: tail -f /tmp/backend.log"
echo "   Admin:   tail -f /tmp/admin.log"
echo "   Staff:   tail -f /tmp/staff.log"
echo "   Expo:    tail -f /tmp/expo.log"
echo ""
echo "🛑 To stop all:"
echo "   killall npm node"
echo ""
