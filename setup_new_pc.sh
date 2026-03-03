#!/bin/bash

################################################################################
#  GENTRUST MOBILITY - ШВИДКЕ РОЗГОРТАННЯ НА НОВОМУ ПК                        #
#                                                                              #
#  Використання: ./setup_new_pc.sh                                             #
################################################################################

echo "╔════════════════════════════════════════════════════════╗"
echo "║   🚀 GENTRUST MOBILITY - SETUP NEW PC                  ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""

# Перевірка Node.js
echo "📦 Перевірка Node.js..."
if ! command -v node &> /dev/null; then
    echo "❌ Node.js не встановлено!"
    echo "   Встановіть з: https://nodejs.org/"
    exit 1
fi
echo "✅ Node.js: $(node -v)"

# Перевірка npm
echo "📦 Перевірка npm..."
if ! command -v npm &> /dev/null; then
    echo "❌ npm не встановлено!"
    exit 1
fi
echo "✅ npm: $(npm -v)"

# Встановлення залежностей Backend
echo ""
echo "📦 Встановлення залежностей Backend..."
npm install --silent
echo "✅ Backend готовий"

# Встановлення Prisma
echo ""
echo "📦 Встановлення Prisma..."
npx prisma install --silent
npx prisma generate --silent
echo "✅ Prisma готовий"

# Встановлення Admin Panel
echo ""
echo "📦 Admin Panel..."
cd admin-panel && npm install --silent && cd ..
echo "✅ Admin Panel готовий"

# Встановлення City-Hall Dashboard
echo ""
echo "📦 City-Hall Dashboard..."
cd city-hall-dashboard && npm install --silent && cd ..
echo "✅ City-Hall Dashboard готовий"

# Встановлення Staff Panel
echo ""
echo "📦 Staff Panel..."
cd staff-panel && npm install --silent && cd ..
echo "✅ Staff Panel готовий"

# Встановлення Department Dashboards
echo ""
echo "📦 Department Dashboards (8)..."
for dept in roads lighting waste parks water transport ecology vandalism; do
    echo "   📦 $dept..."
    cd departments/$dept && npm install --silent && cd ../..
done
echo "✅ Всі департаменти готові"

# Встановлення Mobile School
echo ""
echo "📦 Mobile School..."
cd mobile-school && npm install --silent && cd ..
echo "✅ Mobile School готовий"

# Встановлення Mobile Parent
echo ""
echo "📦 Mobile Parent..."
cd mobile-parent && npm install --silent && cd ..
echo "✅ Mobile Parent готовий"

# Встановлення Monitor
echo ""
echo "📦 Monitor Dashboard..."
cd monitor && npm install --silent && cd ..
echo "✅ Monitor Dashboard готовий"

# Створення бази даних
echo ""
echo "🗄️ Створення бази даних..."
npx prisma migrate dev --name init --silent
echo "✅ База даних створена"

# Фінальне повідомлення
echo ""
echo "╔════════════════════════════════════════════════════════╗"
echo "║   ✅ ВСЕ ГОТОВО!                                       ║"
echo "╚════════════════════════════════════════════════════════╝"
echo ""
echo "📋 НАСТУПНІ КРОКИ:"
echo ""
echo "1️⃣  Створіть .env файл:"
echo "   cp .env.example .env"
echo "   Відредагуйте .env і додайте свої токени"
echo ""
echo "2️⃣  Запустіть всі сервіси:"
echo "   bash start.sh"
echo ""
echo "3️⃣  Або через Monitor Dashboard:"
echo "   cd monitor && node server.js"
echo "   Відкрийте: http://localhost:9000"
echo ""
echo "📊 ВСІ ПОРТИ:"
echo "   Monitor:     http://localhost:9000"
echo "   Backend:     http://localhost:3000/api"
echo "   City-Hall:   http://localhost:5173"
echo "   Admin:       http://localhost:5174"
echo "   Staff:       http://localhost:5176"
echo "   Roads:       http://localhost:5180"
echo "   Lighting:    http://localhost:5181"
echo "   Waste:       http://localhost:5182"
echo "   Parks:       http://localhost:5183"
echo "   Water:       http://localhost:5184"
echo "   Transport:   http://localhost:5185"
echo "   Ecology:     http://localhost:5186"
echo "   Vandalism:   http://localhost:5187"
echo "   School:      exp://localhost:8082"
echo "   Parent:      exp://localhost:8083"
echo ""
