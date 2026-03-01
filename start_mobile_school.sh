#!/bin/bash
set -e

echo "🔍 GenTrust Mobile School - System Validation & Startup"
echo "=================================================="

# 1. Отримати поточну IP
CURRENT_IP=$(ifconfig en0 | grep "inet " | awk '{print $2}')
if [ -z "$CURRENT_IP" ]; then
    echo "❌ Не вдалося отримати IP адресу Mac!"
    echo "Перевірте підключення до Wi-Fi"
    exit 1
fi
echo "✓ Поточна IP Mac: $CURRENT_IP"

# 2. Оновити config.ts
echo "✓ Оновлення mobile-school/config.ts..."
sed -i '' "s/const API_HOST = '.*';/const API_HOST = '$CURRENT_IP';/" mobile-school/config.ts
echo "  API_HOST встановлено на: $CURRENT_IP"

# 3. Перевірити src/api/server.ts
if ! grep -q "0.0.0.0" src/api/server.ts; then
    echo "⚠️  ПОПЕРЕДЖЕННЯ: src/api/server.ts не має '0.0.0.0'"
    echo "  Backend може не бути доступним з телефону!"
fi

# 4. Зупинити старі процеси
echo "✓ Зупинка старих процесів..."
pkill -9 -f "ts-node.*api-only" 2>/dev/null || true
pkill -9 -f "expo start" 2>/dev/null || true
sleep 2

# 5. Видалити dist якщо існує
if [ -d "dist" ]; then
    echo "⚠️  Видалення dist/ щоб уникнути конфліктів..."
    rm -rf dist/
fi

# 6. Запустити Backend API
echo "✓ Запуск Backend API..."
npx ts-node src/api-only.ts > server.log 2>&1 &
BACKEND_PID=$!

# Чекаємо поки backend запуститься (до 15 секунд)
echo "  Очікування запуску Backend..."
for i in {1..15}; do
    sleep 1
    if lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
        echo "  ✓ Backend запустився за $i секунд"
        break
    fi
    if [ $i -eq 15 ]; then
        echo "❌ Backend не запустився за 15 секунд!"
        echo "Логи з server.log:"
        tail -30 server.log
        exit 1
    fi
done

# 7. Перевірити чи Backend запустився
if ! lsof -nP -iTCP:3000 -sTCP:LISTEN >/dev/null 2>&1; then
    echo "❌ Backend не працює!"
    exit 1
fi

# 8. Перевірити чи Backend слухає на всіх інтерфейсах
if lsof -nP -iTCP:3000 -sTCP:LISTEN | grep -q "\*:3000"; then
    echo "✓ Backend слухає на *:3000 (0.0.0.0) - доступний з телефону"
else
    echo "⚠️  Backend слухає тільки на localhost!"
    echo "  Відредагуйте src/api/server.ts: app.listen(portNumber, '0.0.0.0', ...)"
fi

# 9. Тест Backend health endpoint
echo "✓ Тестування Backend health endpoint..."
HEALTH_RESPONSE=$(curl -s http://$CURRENT_IP:3000/api/health 2>&1)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo "  ✓ Backend health: OK"
else
    echo "  ❌ Backend health не відповідає!"
    echo "  Відповідь: $HEALTH_RESPONSE"
fi

echo ""
echo "=================================================="
echo "✅ Backend готовий!"
echo "   URL: http://$CURRENT_IP:3000/api"
echo "   Health: http://$CURRENT_IP:3000/api/health"
echo "   PID: $BACKEND_PID"
echo ""
echo "📱 Тепер запускаю Expo Metro Bundler..."
echo "   Після появи QR коду відскануйте його в Expo Go"
echo "=================================================="
echo ""

# 10. Запустити Expo (з --non-interactive щоб не запитувати логін)
cd mobile-school
npx expo start --port 8082 --lan

# Коли користувач натисне Ctrl+C
trap "echo ''; echo 'Зупинка Backend...'; kill $BACKEND_PID 2>/dev/null; exit 0" INT TERM
