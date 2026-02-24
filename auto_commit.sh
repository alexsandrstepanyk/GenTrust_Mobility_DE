#!/bin/bash

# 🤖 GENTRUST MOBILITY - Auto Commit & Push Script
# Автоматично робить commit і push після кожної зміни
# Використання: ./auto_commit.sh "опис" або ./auto_commit.sh

set -e

# Кольори
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

# Автоматичне визначення версії
get_version_type() {
    local msg="$1"
    if [[ "$msg" == *"fix"* ]] || [[ "$msg" == *"bug"* ]] || [[ "$msg" == *"виправ"* ]]; then
        echo "PATCH"
    elif [[ "$msg" == *"feat"* ]] || [[ "$msg" == *"add"* ]] || [[ "$msg" == *"дод"* ]]; then
        echo "MINOR"
    elif [[ "$msg" == *"major"* ]] || [[ "$msg" == *"global"* ]] || [[ "$msg" == *"arch"* ]]; then
        echo "MAJOR"
    else
        echo "PATCH"
    fi
}

# Отримання поточної версії з package.json
get_current_version() {
    grep '"version"' package.json | cut -d'"' -f4
}

# Збільшення версії
bump_version() {
    local type=$1
    local current=$(get_current_version)
    local major=$(echo $current | cut -d. -f1)
    local minor=$(echo $current | cut -d. -f2)
    local patch=$(echo $current | cut -d. -f3)
    
    case $type in
        MAJOR)
            major=$((major + 1))
            minor=0
            patch=0
            ;;
        MINOR)
            minor=$((minor + 1))
            patch=0
            ;;
        PATCH)
            patch=$((patch + 1))
            ;;
    esac
    
    echo "${major}.${minor}.${patch}"
}

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  🤖 GENTRUST - AUTO COMMIT & PUSH                     ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""

# Отримання опису змін
if [ -n "$1" ]; then
    MESSAGE="$1"
else
    # Автоматичне визначення змін
    CHANGED_FILES=$(git status --short | head -10 | awk '{print $2}' | tr '\n' ', ' | sed 's/,$//')
    if [ -z "$CHANGED_FILES" ]; then
        echo -e "${GREEN}✅ Немає змін для commit${NC}"
        exit 0
    fi
    MESSAGE="auto: Зміни в $CHANGED_FILES"
fi

# Визначення типу змін
VERSION_TYPE=$(get_version_type "$MESSAGE")

# Отримання поточної версії
CURRENT_VERSION=$(get_current_version)
NEW_VERSION=$(bump_version $VERSION_TYPE)

echo -e "${YELLOW}📊 Поточна версія: ${GREEN}$CURRENT_VERSION${NC}"
echo -e "${YELLOW}📈 Нова версія: ${GREEN}$NEW_VERSION${NC}"
echo -e "${YELLOW}📝 Тип змін: ${GREEN}$VERSION_TYPE${NC}"
echo -e "${YELLOW}💬 Повідомлення: ${GREEN}$MESSAGE${NC}"
echo ""

# 1. Додавання змін
echo -e "${YELLOW}📦 Додавання файлів...${NC}"
git add -A
echo -e "${GREEN}   ✅ Файли додано${NC}"
echo ""

# 2. Commit
echo -e "${YELLOW}💾 Створення commit...${NC}"
COMMIT_MSG="v$NEW_VERSION - $MESSAGE"
git commit -m "$COMMIT_MSG"
echo -e "${GREEN}   ✅ Commit: $COMMIT_MSG${NC}"
echo ""

# 3. Оновлення версії в package.json
echo -e "${YELLOW}📝 Оновлення версії в package.json...${NC}"
if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
else
    sed -i "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
fi
git add package.json
git commit -m "chore: Bump version to v$NEW_VERSION" || true
echo -e "${GREEN}   ✅ Версію оновлено до $NEW_VERSION${NC}"
echo ""

# 4. Push (якщо налаштовано GitHub)
echo -e "${YELLOW}📤 Push на GitHub...${NC}"
if git remote -v | grep -q origin; then
    git push origin main
    echo -e "${GREEN}   ✅ Push завершено${NC}"
    
    # Створення тегу
    echo -e "${YELLOW}🏷️  Створення тегу v$NEW_VERSION...${NC}"
    git tag -a "v$NEW_VERSION" -m "$MESSAGE"
    git push origin "v$NEW_VERSION"
    echo -e "${GREEN}   ✅ Тег створено${NC}"
else
    echo -e "${YELLOW}   ⚠️  GitHub не налаштовано (немає remote 'origin')${NC}"
    echo -e "${YELLOW}   💡 Для налаштування: git remote add origin <URL>${NC}"
fi
echo ""

# 5. Підсумок
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  ✅ АВТОМАТИЧНО ВИКОНАНО!                              ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}Версія: ${YELLOW}v$NEW_VERSION${NC}"
echo -e "${GREEN}Тип: ${YELLOW}$VERSION_TYPE${NC}"
echo -e "${GREEN}Commit: ${YELLOW}$COMMIT_MSG${NC}"
echo ""
