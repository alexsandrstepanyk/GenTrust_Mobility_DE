#!/bin/bash

################################################################################
# ОНОВЛЕННЯ ВСІХ ДЕПАРТАМЕНТІВ
# Копіює новий код з department-dashboard в кожну папку департаменту
################################################################################

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
DEPT_DASHBOARD="$PROJECT_DIR/department-dashboard"
DEPARTMENTS_DIR="$PROJECT_DIR/departments"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  ОНОВЛЕННЯ ВСІХ ДЕПАРТАМЕНТІВ"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Список департаментів
DEPARTMENTS=("roads" "lighting" "waste" "parks" "water" "transport" "ecology" "vandalism")

# Файли для копіювання
FILES_TO_COPY=(
  "src/App.tsx"
  "src/components/Layout.tsx"
  "src/pages/Dashboard.tsx"
  "src/pages/Reports.tsx"
  "src/pages/Settings.tsx"
  "src/pages/Users.tsx"
  "src/lib/api.ts"
  "src/lib/socket.ts"
  "src/lib/utils.ts"
  "src/vite-env.d.ts"
  "public/departments.config.json"
)

for dept in "${DEPARTMENTS[@]}"; do
  echo -e "${YELLOW}→${NC} Оновлення департаменту: ${GREEN}$dept${NC}..."
  
  DEPT_PATH="$DEPARTMENTS_DIR/$dept"
  
  # Копіювання файлів
  for file in "${FILES_TO_COPY[@]}"; do
    src="$DEPT_DASHBOARD/$file"
    dst="$DEPT_PATH/$file"
    
    if [ -f "$src" ]; then
      cp "$src" "$dst"
      echo -e "  ${GREEN}✓${NC} Скопійовано: $file"
    else
      echo -e "  ${YELLOW}⚠${NC} Не знайдено: $file"
    fi
  done
  
  echo ""
done

echo -e "${GREEN}✅${NC} Всі департаменти оновлені!"
echo ""
echo -e "${YELLOW}→${NC} Наступний крок: Перезапустіть департаменти"
echo -e "${YELLOW}  ${NC}bash stop.sh && bash start.sh"
echo ""
