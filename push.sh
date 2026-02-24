#!/bin/bash

# 🚀 GENTRUST MOBILITY - GitHub Push Script
# Використання: ./push.sh "<version>" "<опис>"

set -e

# Кольори
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Перевірка аргументів
if [ -z "$1" ]; then
    echo -e "${RED}❌ Використання: ./push.sh \"<version>\" \"<опис>\"${NC}"
    echo -e "${YELLOW}Приклад: ./push.sh \"v3.1.1\" \"Виправлено помилку в LoginScreen\"${NC}"
    exit 1
fi

VERSION=$1
DESCRIPTION=${2:-"Release $VERSION"}

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🚀 GENTRUST MOBILITY - GITHUB PUSH                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# 1. Перевірка змін
echo -e "${YELLOW}📊 Перевірка змін...${NC}"
git status --short
echo ""

# 2. Додавання всіх змін
echo -e "${YELLOW}📦 Додавання файлів...${NC}"
git add -A
echo -e "${GREEN}   ✅ Файли додано${NC}"
echo ""

# 3. Commit
echo -e "${YELLOW}💾 Створення commit...${NC}"
git commit -m "$VERSION - $DESCRIPTION" || echo -e "${YELLOW}   ⚠️  Немає змін для commit${NC}"
echo -e "${GREEN}   ✅ Commit створено${NC}"
echo ""

# 4. Push
echo -e "${YELLOW}📤 Push на GitHub...${NC}"
git push origin main
echo -e "${GREEN}   ✅ Push завершено${NC}"
echo ""

# 5. Створення тегу
echo -e "${YELLOW}🏷️  Створення тегу...${NC}"
git tag -a $VERSION -m "$DESCRIPTION"
git push origin $VERSION
echo -e "${GREEN}   ✅ Тег створено${NC}"
echo ""

# 6. Підсумок
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ УСПІШНО!                                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Версія: ${YELLOW}$VERSION${NC}"
echo -e "${GREEN}Опис: ${YELLOW}$DESCRIPTION${NC}"
echo ""
echo -e "${GREEN}🔗 GitHub: https://github.com/alexsandrstepanyk/GenTrust_Mobility_DE${NC}"
echo ""
