#!/bin/bash

################################################################################
# ПЕРЕВІРКА МІГРАЦІЇ БАЗ ДАНИХ
# Перевіряє наявність баз даних департаментів та даних в них
################################################################################

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
MAIN_DB="$PROJECT_DIR/prisma/dev.db"
DATABASES_DIR="$PROJECT_DIR/databases"

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
echo -e "${BLUE}║${NC}  ПЕРЕВІРКА МІГРАЦІЇ БАЗ ДАНИХ"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Перевірка головної бази
echo -e "${YELLOW}→${NC} Перевірка головної бази даних..."
if [ ! -f "$MAIN_DB" ]; then
    echo -e "${RED}❌${NC} Головна база не знайдена: $MAIN_DB"
    exit 1
fi

MAIN_USERS=$(sqlite3 "$MAIN_DB" "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")
MAIN_REPORTS=$(sqlite3 "$MAIN_DB" "SELECT COUNT(*) FROM Report;" 2>/dev/null || echo "0")

echo -e "${GREEN}✅${NC} Головна база: $MAIN_DB"
echo -e "   Користувачів: ${YELLOW}$MAIN_USERS${NC}"
echo -e "   Звітів: ${YELLOW}$MAIN_REPORTS${NC}\n"

# Перевірка баз департаментів
echo -e "${YELLOW}→${NC} Перевірка баз департаментів...\n"

TOTAL_REPORTS=0
ALL_EXIST=true

for dept in "${DEPARTMENTS[@]}"; do
    IFS=':' read -r dept_id dept_name <<< "$dept"
    
    DEPT_DB="$DATABASES_DIR/${dept_id}_dept.db"
    
    if [ ! -f "$DEPT_DB" ]; then
        echo -e "${RED}❌${NC} $dept_name: База не знайдена"
        ALL_EXIST=false
        continue
    fi
    
    # Перевірка таблиць
    TABLES=$(sqlite3 "$DEPT_DB" ".tables" 2>/dev/null | wc -w | tr -d ' ')
    
    # Перевірка кількості звітів
    REPORTS=$(sqlite3 "$DEPT_DB" "SELECT COUNT(*) FROM DepartmentReport;" 2>/dev/null || echo "0")
    PENDING=$(sqlite3 "$DEPT_DB" "SELECT COUNT(*) FROM DepartmentReport WHERE status='PENDING';" 2>/dev/null || echo "0")
    APPROVED=$(sqlite3 "$DEPT_DB" "SELECT COUNT(*) FROM DepartmentReport WHERE status='APPROVED';" 2>/dev/null || echo "0")
    
    # Перевірка статистики
    STATS=$(sqlite3 "$DEPT_DB" "SELECT COUNT(*) FROM DepartmentStats;" 2>/dev/null || echo "0")
    
    echo -e "${GREEN}✅${NC} $dept_name ($dept_id)"
    echo -e "   База: ${GREEN}$DEPT_DB${NC}"
    echo -e "   Таблиць: ${YELLOW}$TABLES${NC}"
    echo -e "   Звітів: ${YELLOW}$REPORTS${NC} (PENDING: $PENDING, APPROVED: $APPROVED)"
    echo -e "   Статистика: ${YELLOW}$STATS${NC} записів\n"
    
    TOTAL_REPORTS=$((TOTAL_REPORTS + REPORTS))
done

# Підсумки
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ПІДСУМКИ"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

if [ "$ALL_EXIST" = true ]; then
    echo -e "${GREEN}✅${NC} Всі бази даних департаментів існують"
else
    echo -e "${RED}❌${NC} Деякі бази даних відсутні"
    echo -e "${YELLOW}→${NC} Запустіть: ${CYAN}bash scripts/init_department_dbs.sh${NC}\n"
fi

echo -e "${YELLOW}→${NC} Всього звітів мігровано: ${GREEN}$TOTAL_REPORTS${NC}"

if [ "$TOTAL_REPORTS" -gt 0 ]; then
    echo -e "${GREEN}✅${NC} Міграція даних виконана успішно!"
else
    echo -e "${YELLOW}⚠️${NC} Дані не мігровано"
    echo -e "${YELLOW}→${NC} Запустіть: ${CYAN}bash scripts/migrate_departments.sh${NC}\n"
fi

echo ""
echo -e "${YELLOW}→${NC} Наступні кроки:"
echo -e "  1. Перевірте API: ${CYAN}curl http://localhost:3000/api/departments${NC}"
echo -e "  2. Відкрийте City-Hall: ${CYAN}http://localhost:5173${NC}"
echo -e "  3. Натисніть 'Департаменти' для перегляду статистики"
echo -e "  4. Запустіть систему: ${CYAN}bash start.sh${NC}"
echo ""
