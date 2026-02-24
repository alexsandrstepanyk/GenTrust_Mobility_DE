#!/bin/bash
echo "🛑 Зупиняю GenTrust сервіси..."
pkill -f "node dist" 2>/dev/null && echo "✅ Telegram боти зупинено" || echo "⚠️  Боти не запущено"
pkill -f "npm run dev" 2>/dev/null && echo "✅ Dev сервер зупинено" || echo "⚠️  Dev не запущено"
pkill -f "expo start" 2>/dev/null && echo "✅ Expo Frontend зупинено" || echo "⚠️  Frontend не запущено"
pkill -f "npm start" 2>/dev/null || true
pkill -f "xcrun simctl" 2>/dev/null || true
pkill -f "watchman" 2>/dev/null || true
echo "Done! Всі сервіси зупинені."
