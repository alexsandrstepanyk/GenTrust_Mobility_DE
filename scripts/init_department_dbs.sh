#!/bin/bash

################################################################################
# ІНІЦІАЛІЗАЦІЯ БАЗ ДАНИХ ДЛЯ ДЕПАРТАМЕНТІВ
# Цей скрипт створює 8 окремих SQLite баз для кожного департаменту
################################################################################

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
DATABASES_DIR="$PROJECT_DIR/databases"
PRISMA_DIR="$PROJECT_DIR/prisma"

# Департаменти
DEPARTMENTS=(
  "roads:Дороги"
  "lighting:Освітлення"
  "waste:Сміття"
  "parks:Парки"
  "water:Вода"
  "transport:Транспорт"
  "ecology:Екологія"
  "vandalism:Вандалізм"
)

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ІНІЦІАЛІЗАЦІЯ БАЗ ДАНИХ ДЕПАРТАМЕНТІВ"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Створення папки
echo -e "${YELLOW}→${NC} Створення папки databases..."
mkdir -p "$DATABASES_DIR"
echo -e "${GREEN}✅${NC} Папка створена: $DATABASES_DIR\n"

# Створення шаблону
echo -e "${YELLOW}→${NC} Створення шаблону бази даних..."

TEMPLATE_DB="$DATABASES_DIR/template_dept.db"
TEMPLATE_SCHEMA="$PRISMA_DIR/schema_departments.prisma"

# Заміна URL в шаблоні
cd "$PRISMA_DIR"
sed 's|file:../databases/TEMPLATE_dept.db|file:'"$DATABASES_DIR"'/template_dept.db|g' "$TEMPLATE_SCHEMA" > "$PRISMA_DIR/schema_template_temp.prisma"

# Генерація Prisma Client для шаблону
echo -e "${YELLOW}→${NC} Генерація Prisma Client для шаблону..."
npx prisma generate --schema="$PRISMA_DIR/schema_template_temp.prisma" > /dev/null 2>&1

# Міграція шаблону
echo -e "${YELLOW}→${NC} Створення таблиць в шаблоні..."
npx prisma migrate dev --schema="$PRISMA_DIR/schema_template_temp.prisma" --name init_department_db --create-only > /dev/null 2>&1

echo -e "${GREEN}✅${NC} Шаблон створено: $TEMPLATE_DB\n"

# Створення баз для кожного департаменту
for dept in "${DEPARTMENTS[@]}"; do
  IFS=':' read -r dept_id dept_name <<< "$dept"
  
  echo -e "${YELLOW}→${NC} Створення БД для: ${GREEN}$dept_name${NC} ($dept_id)..."
  
  DEPT_DB="$DATABASES_DIR/${dept_id}_dept.db"
  
  # Копіювання шаблону
  cp "$TEMPLATE_DB" "$DEPT_DB"
  
  # Оновлення schema для департаменту
  sed 's|file:../databases/TEMPLATE_dept.db|file:'"$DEPT_DB"'|g' "$TEMPLATE_SCHEMA" > "$PRISMA_DIR/schema_${dept_id}_temp.prisma"
  
  # Генерація Prisma Client
  npx prisma generate --schema="$PRISMA_DIR/schema_${dept_id}_temp.prisma" > /dev/null 2>&1
  
  # Міграція
  npx prisma migrate dev --schema="$PRISMA_DIR/schema_${dept_id}_temp.prisma" --name init_${dept_id}_dept --create-only > /dev/null 2>&1
  
  # Додавання початкових налаштувань
  sqlite3 "$DEPT_DB" "INSERT INTO DepartmentSettings (id, notificationEmail, notificationPhone, responsiblePerson, autoApproveThreshold, maxReportsPerDay) VALUES ('settings', '', '', '', 0.85, 100);"
  
  echo -e "${GREEN}✅${NC} $dept_name: $DEPT_DB"
done

# Очищення тимчасових файлів
echo -e "\n${YELLOW}→${NC} Очищення тимчасових файлів..."
rm -f "$PRISMA_DIR"/schema_*_temp.prisma 2>/dev/null || true
rm -f "$DATABASES_DIR/template_dept.db" 2>/dev/null || true
rm -rf "$PRISMA_DIR/migrations" 2>/dev/null || true

echo -e "${GREEN}✅${NC} Готово!\n"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  СТВОРЕНО БАЗИ ДАНИХ:"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "   🛣️  Roads:       ${GREEN}$DATABASES_DIR/roads_dept.db${NC}"
echo -e "   💡 Lighting:     ${GREEN}$DATABASES_DIR/lighting_dept.db${NC}"
echo -e "   🗑️  Waste:       ${GREEN}$DATABASES_DIR/waste_dept.db${NC}"
echo -e "   🌳 Parks:        ${GREEN}$DATABASES_DIR/parks_dept.db${NC}"
echo -e "   🚰 Water:        ${GREEN}$DATABASES_DIR/water_dept.db${NC}"
echo -e "   🚌 Transport:    ${GREEN}$DATABASES_DIR/transport_dept.db${NC}"
echo -e "   🌿 Ecology:      ${GREEN}$DATABASES_DIR/ecology_dept.db${NC}"
echo -e "   🎨 Vandalism:    ${GREEN}$DATABASES_DIR/vandalism_dept.db${NC}"
echo ""
echo -e "${YELLOW}→${NC} Наступний крок: Запустіть міграцію даних"
echo -e "${YELLOW}  ${NC}bash scripts/migrate_departments.sh"
echo ""
