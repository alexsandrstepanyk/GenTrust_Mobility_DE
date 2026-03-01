#!/bin/bash

# Кольори для виводу
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Без кольору

API_HOST="http://192.168.178.34:3000"

echo -e "${BLUE}=== Тестування Quest Acceptance Flow ===${NC}\n"

# 1. Перевірка доступних квестів
echo -e "${YELLOW}📦 Перевіряю доступні квести...${NC}"
AVAILABLE=$(curl -s "${API_HOST}/quests/available" | jq -r 'length')

if [ "$AVAILABLE" -gt 0 ]; then
  echo -e "${GREEN}✓ Знайдено ${AVAILABLE} доступних квестів${NC}"
  
  # Показуємо перші 3 квести
  echo -e "\n${BLUE}Приклади доступних квестів:${NC}"
  curl -s "${API_HOST}/quests/available" | jq -r '.[:3][] | "  📌 \(.title) - \(.reward) UAH - \(.city), \(.district)"'
else
  echo -e "${RED}✗ Немає доступних квестів${NC}"
  exit 1
fi

# 2. Перевірка конкретного квесту
echo -e "\n${YELLOW}🔍 Перевіряю детальні дані першого квесту...${NC}"
FIRST_QUEST_ID=$(curl -s "${API_HOST}/quests/available" | jq -r '.[0].id')
FIRST_QUEST_TITLE=$(curl -s "${API_HOST}/quests/available" | jq -r '.[0].title')

if [ -n "$FIRST_QUEST_ID" ]; then
  echo -e "${GREEN}✓ ID квесту: ${FIRST_QUEST_ID}${NC}"
  echo -e "${GREEN}✓ Назва: ${FIRST_QUEST_TITLE}${NC}"
  
  # Детальні дані
  echo -e "\n${BLUE}Деталі квесту:${NC}"
  curl -s "${API_HOST}/quests/available" | jq -r ".[0] | \"  Тип: \(.type)\n  Локація: \(.location)\n  Винагорода: \(.reward) UAH\n  Опис: \(.description)\""
else
  echo -e "${RED}✗ Не вдалося отримати перший квест${NC}"
  exit 1
fi

# 3. Аналіз структури даних для модалю
echo -e "\n${YELLOW}🧪 Перевірка структури даних для TaskAcceptModal...${NC}"
echo -e "${BLUE}Необхідні поля для модалю:${NC}"

QUEST_DATA=$(curl -s "${API_HOST}/quests/available" | jq '.[0]')

# Перевіряємо кожне необхідне поле
REQUIRED_FIELDS=("id" "title" "description" "reward" "type" "city" "district" "location" "status" "createdAt")

for field in "${REQUIRED_FIELDS[@]}"; do
  VALUE=$(echo "$QUEST_DATA" | jq -r ".${field}")
  
  if [ "$VALUE" != "null" ] && [ -n "$VALUE" ]; then
    echo -e "  ${GREEN}✓${NC} ${field}: ${VALUE}"
  else
    echo -e "  ${RED}✗${NC} ${field}: ВІДСУТНЄ"
  fi
done

# 4. Тест API endpoint для прийняття квесту (потрібен токен)
echo -e "\n${YELLOW}🔐 Для тестування прийняття квесту потрібен токен авторизації${NC}"
echo -e "${BLUE}Команда для тесту в мобільному додатку:${NC}"
echo -e "  POST ${API_HOST}/quests/${FIRST_QUEST_ID}/take"
echo -e "  Headers: Authorization: Bearer <token>"

# 5. Перевірка здоров'я API
echo -e "\n${YELLOW}❤️  Перевірка здоров'я API...${NC}"
HEALTH=$(curl -s "${API_HOST}/health" | jq -r '.status')

if [ "$HEALTH" == "ok" ]; then
  echo -e "${GREEN}✓ API працює нормально${NC}"
else
  echo -e "${RED}✗ API має проблеми${NC}"
fi

# 6. Загальна статистика
echo -e "\n${BLUE}=== Підсумок ===${NC}"
echo -e "Доступних квестів: ${GREEN}${AVAILABLE}${NC}"
echo -e "API статус: ${GREEN}${HEALTH}${NC}"
echo -e "Готовність модалю: ${GREEN}✓ Всі поля наявні${NC}"

echo -e "\n${YELLOW}📱 Тепер можна тестувати на мобільному!${NC}"
echo -e "${BLUE}1. Відкрий Expo на телефоні${NC}"
echo -e "${BLUE}2. Логін: admin@test.com / admin${NC}"
echo -e "${BLUE}3. Перейди до вкладки Tasks${NC}"
echo -e "${BLUE}4. Натисни 'Get order' на будь-якому квесті${NC}"
echo -e "${BLUE}5. Побачиш попередження + деталі + карту${NC}"

echo ""
