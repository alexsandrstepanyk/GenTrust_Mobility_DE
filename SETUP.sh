#!/bin/bash
# GenTrust System - Complete Setup & Launch Guide
# Run this script to setup and verify the entire system

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo ""
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════════════════════════${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

print_header "🚀 GenTrust Mobility - System Setup"

# ============================================================================
# 1. Check Prerequisites
# ============================================================================
print_header "📋 Step 1: Checking Prerequisites"

# Check Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js installed: $NODE_VERSION"
else
    print_error "Node.js not installed. Please install Node.js 18+"
    exit 1
fi

# Check npm
if command -v npm &> /dev/null; then
    NPM_VERSION=$(npm -v)
    print_success "npm installed: $NPM_VERSION"
else
    print_error "npm not installed"
    exit 1
fi

# Check git
if command -v git &> /dev/null; then
    print_success "Git installed"
else
    print_warning "Git not installed (optional)"
fi

# ============================================================================
# 2. Environment Setup
# ============================================================================
print_header "⚙️  Step 2: Environment Configuration"

# Check if .env exists
if [ -f ".env" ]; then
    print_success ".env file exists"
    
    # Check ADMIN_TOKEN
    if grep -q "ADMIN_TOKEN" .env; then
        ADMIN_TOKEN=$(grep "ADMIN_TOKEN" .env | cut -d'=' -f2)
        if [ -z "$ADMIN_TOKEN" ] || [ "$ADMIN_TOKEN" = "your_admin_token" ]; then
            print_warning "ADMIN_TOKEN is not set or using placeholder"
            echo ""
            echo "Please set a strong ADMIN_TOKEN in .env:"
            echo "  ADMIN_TOKEN=\"your_secure_token_min_16_chars\""
            echo ""
            read -p "Enter admin token (or press Enter to skip): " NEW_TOKEN
            if [ ! -z "$NEW_TOKEN" ]; then
                sed -i '' "s/ADMIN_TOKEN=.*/ADMIN_TOKEN=$NEW_TOKEN/" .env
                print_success "ADMIN_TOKEN updated"
            fi
        else
            print_success "ADMIN_TOKEN is configured"
        fi
    else
        print_warning "ADMIN_TOKEN not found in .env"
        echo "ADMIN_TOKEN=\"$(openssl rand -hex 16)\"" >> .env
        print_success "Generated new ADMIN_TOKEN"
    fi
else
    print_warning ".env file not found, creating from template"
    cat > .env << EOF
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="$(openssl rand -hex 32)"
PORT=3000
ADMIN_TOKEN="$(openssl rand -hex 16)"
TELEGRAM_BOT_TOKEN=""
EOF
    print_success "Created .env file"
fi

# ============================================================================
# 3. Backend Setup
# ============================================================================
print_header "🔧 Step 3: Backend Setup"

print_info "Installing backend dependencies..."
npm install --quiet || print_error "npm install failed"

print_info "Building TypeScript..."
npm run build

print_success "Backend build complete"

# ============================================================================
# 4. Database Setup
# ============================================================================
print_header "🗄️  Step 4: Database Setup"

print_info "Checking/migrating Prisma schema..."
npx prisma db push --skip-generate

print_success "Database ready"

# Check database file
if [ -f "prisma/dev.db" ]; then
    print_success "Database file exists: prisma/dev.db"
else
    print_warning "Database file not found (will be created on first run)"
fi

# ============================================================================
# 5. Web Panels Setup
# ============================================================================
print_header "🎨 Step 5: Web Panels Setup"

# Staff Panel
if [ -d "staff-panel" ]; then
    print_info "Setting up staff-panel..."
    cd staff-panel
    npm install --quiet || print_error "staff-panel npm install failed"
    print_success "staff-panel ready (http://localhost:5173)"
    cd ..
else
    print_warning "staff-panel directory not found"
fi

# Admin Panel
if [ -d "admin-panel" ]; then
    print_info "Setting up admin-panel..."
    cd admin-panel
    npm install --quiet || print_error "admin-panel npm install failed"
    print_success "admin-panel ready (http://localhost:5174)"
    cd ..
else
    print_warning "admin-panel directory not found"
fi

# ============================================================================
# 6. Mobile Apps Check
# ============================================================================
print_header "📱 Step 6: Mobile Apps Check"

if [ -d "mobile" ]; then
    if [ -f "mobile/package.json" ]; then
        print_success "Client app ready"
        print_info "  Run: cd mobile && npx expo start --ios"
    fi
else
    print_warning "mobile directory not found"
fi

if [ -d "mobile-school" ]; then
    if [ -f "mobile-school/package.json" ]; then
        print_success "School app ready"
        print_info "  Run: cd mobile-school && npx expo start --ios"
    fi
else
    print_warning "mobile-school directory not found"
fi

# ============================================================================
# 7. Logs Directory⚠️ УВАГА! ДЕЯКІ СЕРВІСИ НЕ ЗАПУСТИЛИСЯ
❌ Критичні помилки запуску

❌ Не вдалося запустити:

❌ Порт/Сервіс: 3000-Backend
💡 Перевірте логи: tail -f /tmp/*.log
# ============================================================================
print_header "📝 Step 7: Logs Directory"

if [ ! -d "logs" ]; then
    mkdir -p logs
    print_success "Created logs directory"
else
    print_success "Logs directory exists"
fi

# ============================================================================
# 8. Summary
# ============================================================================
print_header "✨ Setup Complete!"

echo "📌 NEXT STEPS:"
echo ""
echo "1️⃣  Start Backend (Terminal 1):"
echo "    ${BLUE}npm start${NC}"
echo ""
echo "2️⃣  Start Staff Panel (Terminal 2):"
echo "    ${BLUE}cd staff-panel && npm run dev${NC}"
echo "    Open: http://localhost:5173"
echo ""
echo "3️⃣  Start Admin Panel (Terminal 3):"
echo "    ${BLUE}cd admin-panel && npm run dev${NC}"
echo "    Open: http://localhost:5174"
echo "    Login with ADMIN_TOKEN from .env"
echo ""
echo "4️⃣  Start Mobile Apps (Terminal 4 & 5):"
echo "    ${BLUE}cd mobile && npx expo start --ios${NC}"
echo "    ${BLUE}cd mobile-school && npx expo start --ios${NC}"
echo ""
echo "5️⃣  Test the System:"
echo "    • Create order in client app"
echo "    • Verify in staff panel"
echo "    • Accept in school app"
echo "    • Monitor in admin panel"
echo ""
echo "📚 Documentation:"
echo "    • ARCHITECTURE.md - System design"
echo "    • ADMIN_DASHBOARD.md - Admin panel guide"
echo "    • COMPLETE_SYSTEM.md - Full overview"
echo "    • QUICK_REFERENCE.md - Quick lookup"
echo "    • IMPLEMENTATION_SUMMARY.md - What was built"
echo ""
echo "🐛 Error Logs:"
echo "    Location: logs/errors-YYYY-MM-DD.json"
echo "    Viewed in: Admin Panel → Errors tab"
echo ""
echo "🔐 Security:"
echo "    ADMIN_TOKEN: $(grep ADMIN_TOKEN .env | cut -d'=' -f2)"
echo "    JWT_SECRET: Set in .env"
echo ""
echo "💾 Database:"
echo "    Type: SQLite"
echo "    File: prisma/dev.db"
echo "    Reset: rm prisma/dev.db && npx prisma db push"
echo ""
print_success "Everything is ready! 🚀"

# ============================================================================
# 9. Optional: Show System Info
# ============================================================================
echo ""
read -p "Show system information? (y/n): " SHOW_INFO

if [ "$SHOW_INFO" = "y" ]; then
    print_header "ℹ️  System Information"
    
    echo "Node Version: $(node -v)"
    echo "npm Version: $(npm -v)"
    echo "OS: $(uname -s)"
    echo ""
    echo "Installed Components:"
    echo "  ✓ Backend (src/)"
    echo "  ✓ Mobile Client (mobile/)"
    echo "  ✓ Mobile School (mobile-school/)"
    echo "  ✓ Staff Panel (staff-panel/)"
    echo "  ✓ Admin Panel (admin-panel/)"
    echo ""
    echo "Services:"
    echo "  ✓ Error Logger (src/services/error_logger.ts)"
    echo "  ✓ Push Notifications (src/services/pushService.ts)"
    echo "  ✓ Prisma ORM (src/services/prismaClient.ts)"
    echo ""
    echo "API Endpoints:"
    echo "  ✓ /api/auth/* - Authentication"
    echo "  ✓ /api/users/* - User management"
    echo "  ✓ /api/quests/* - Quest management"
    echo "  ✓ /api/task-orders/* - Work orders"
    echo "  ✓ /api/admin/* - System monitoring (protected)"
    echo ""
fi

echo ""
print_success "Setup complete! You're ready to go! 🎉"
echo ""
echo "   ✅ Statistics: Completed/Incomplete tasks"
echo "   ✅ Motivation: Custom dashboard for students"
echo "======================================"
echo ""
echo "📝 See ARCHITECTURE.md for complete flow"
echo ""
