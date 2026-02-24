#!/bin/bash

# Перевірка синхронізації системи GenTrust
# Покаже поточний стан та зробить тести

echo ""
echo "╔════════════════════════════════════════╗"
echo "║  🔄 ПЕРЕВІРКА СИНХРОНІЗАЦІЇ GENTRUST   ║"
echo "╚════════════════════════════════════════╝"
echo ""

cd /Users/apple/Desktop/GenTrust_Mobility

# Статус backend
echo "📊 Статус Backend API:"
HEALTH=$(curl -s http://localhost:3000/api/health 2>&1)
if [[ $HEALTH == *"ok"* ]] || [[ $HEALTH == *"healthy"* ]]; then
    echo "   ✅ Живий (http://localhost:3000)"
else
    echo "   ❌ Мертвий (http://localhost:3000)"
    echo "   Запустіть: npm start"
fi

echo ""
echo "📋 Завдання в Системі:"

# Запустити тест синхронізації
npx ts-node scripts/test_sync.ts 2>&1 | grep -E "📋|🎯|✅|❌|Всього|[0-9]\.|Резюме|▔|Клієнт|Адмін|Школяр"

echo ""
echo "🔗 API Ендпоінти для Синхронізації:"
echo "   POST   /api/task-orders              → Клієнт створює завдання"
echo "   GET    /api/quests/available         → Школяр отримує завдання"
echo "   POST   /api/task-orders/:id/approve  → Адмін затверджує"
echo "   GET    /admin/task-orders/pending    → Адмін вибачає список"
echo ""

echo "💡 Типові Сценарії:"
echo ""
echo "1️⃣  Клієнт створює замовлення:"
echo "   curl -X POST http://localhost:3000/api/task-orders \\"
echo "   -H 'Authorization: Bearer TOKEN' \\"
echo "   -H 'Content-Type: application/json' \\"
echo "   -d '{\"title\": \"...\", \"budget\": 15, ...}'"
echo ""
echo "2️⃣  Адмін затверджує (через телеграм або API):"
echo "   curl -X POST http://localhost:3000/api/task-orders/ID/approve \\"
echo "   -H 'Authorization: Bearer ADMIN_TOKEN'"
echo ""
echo "3️⃣  Школяр отримує (автоматично в додатку):"
echo "   GET http://localhost:3000/api/quests/available"
echo ""

echo "✨ Перевірка завершена!"
echo ""
