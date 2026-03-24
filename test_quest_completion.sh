#!/bin/bash

################################################################################
# QUEST COMPLETION TEST SCRIPT
# Тестує повний цикл завершення квесту з фото
################################################################################

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
cd "$PROJECT_DIR"

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  QUEST COMPLETION API TEST"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Step 1: Register and login test user
echo -e "${YELLOW}[1/5] Register test user...${NC}"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"testquest@test.com","password":"test123","firstName":"Test","lastName":"Quester","role":"SCOUT"}')

TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to register. Trying to login...${NC}"
    # User might already exist, try login
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{"email":"testquest@test.com","password":"test123"}')
    echo "Login response: $LOGIN_RESPONSE"
    TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 | tr -d '\n' | xargs)
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get token. Response: $REGISTER_RESPONSE${NC}"
    echo "Trying alternative..."
    # Try one more time with fresh user
    UNIQUE_EMAIL="testquest$(date +%s)@test.com"
    REGISTER_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/register \
      -H "Content-Type: application/json" \
      -d "{\"email\":\"$UNIQUE_EMAIL\",\"password\":\"test123\",\"firstName\":\"Test\",\"lastName\":\"Quester\",\"role\":\"SCOUT\"}")
    TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4 | tr -d '\n' | xargs)
fi

if [ -z "$TOKEN" ]; then
    echo -e "${RED}❌ Failed to get token after all attempts${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Token received${NC}"

# Step 2: Get available quests
echo -e "${YELLOW}[2/5] Getting available quests...${NC}"
QUESTS_RESPONSE=$(curl -s -X GET http://localhost:3000/api/quests/available \
  -H "Authorization: Bearer $TOKEN")

QUEST_ID=$(echo "$QUESTS_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -z "$QUEST_ID" ]; then
    echo -e "${RED}❌ No available quests found. Response: $QUESTS_RESPONSE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Quest ID: $QUEST_ID${NC}"

# Step 3: Take the quest
echo -e "${YELLOW}[3/5] Taking quest...${NC}"
TAKE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/quests/$QUEST_ID/take" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json")

# Extract delivery code using more precise method
DELIVERY_CODE=$(echo "$TAKE_RESPONSE" | sed -n 's/.*"deliveryCode":"\([^"]*\)".*/\1/p' | head -1 | tr -d '\n\r' | xargs)

echo "Take response excerpt: $(echo "$TAKE_RESPONSE" | grep -o '"deliveryCode":"[^"]*"')"
echo "Extracted code: '$DELIVERY_CODE'"

if [ -z "$DELIVERY_CODE" ]; then
    echo -e "${RED}❌ Failed to take quest. Response: $TAKE_RESPONSE${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Quest taken. Delivery code: $DELIVERY_CODE${NC}"

# Step 4: Create test image
echo -e "${YELLOW}[4/5] Creating test image...${NC}"
TEST_IMAGE="/tmp/test_completion_$(date +%s).jpg"
# Create a simple 1x1 pixel JPEG
echo -e "\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x00\x00\x01\x00\x01\x00\x00\xFF\xDB\x00C\x00\x08\x06\x06\x07\x06\x05\x08\x07\x07\x07\t\t\x08\n\x0C\x14\r\x0C\x0B\x0B\x0C\x19\x12\x13\x0F\x14\x1D\x1A\x1F\x1E\x1D\x1A\x1C\x1C $.\x22 ,#\x1C\x1C(7),01444\x1F'9=82<.342\xFF\xC0\x00\x0B\x08\x00\x01\x00\x01\x01\x01\x11\x00\xFF\xC4\x00\x1F\x00\x00\x01\x05\x01\x01\x01\x01\x01\x01\x00\x00\x00\x00\x00\x00\x00\x00\x01\x02\x03\x04\x05\x06\x07\x08\t\n\x0B\xFF\xC4\x00\xB5\x10\x00\x02\x01\x03\x03\x02\x04\x03\x05\x05\x04\x04\x00\x00\x01}\x01\x02\x03\x00\x04\x11\x05\x12!1A\x06\x13Qa\x07\"q\x142\x81\x91\xA1\x08#B\xB1\xC1\x15R\xD1\xF0$3br\x82\t\n\x16\x17\x18\x19\x1A%&'()*456789:CDEFGHIJSTUVWXYZcdefghijstuvwxyz\x83\x84\x85\x86\x87\x88\x89\x8A\x92\x93\x94\x95\x96\x97\x98\x99\x9A\xA2\xA3\xA4\xA5\xA6\xA7\xA8\xA9\xAA\xB2\xB3\xB4\xB5\xB6\xB7\xB8\xB9\xBA\xC2\xC3\xC4\xC5\xC6\xC7\xC8\xC9\xCA\xD2\xD3\xD4\xD5\xD6\xD7\xD8\xD9\xDA\xE1\xE2\xE3\xE4\xE5\xE6\xE7\xE8\xE9\xEA\xF1\xF2\xF3\xF4\xF5\xF6\xF7\xF8\xF9\xFA\xFF\xDA\x00\x08\x01\x01\x00\x00?\x00\xFB\xD5\xFF\xD9" > "$TEST_IMAGE"

if [ ! -f "$TEST_IMAGE" ]; then
    echo -e "${RED}❌ Failed to create test image${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Test image created: $TEST_IMAGE${NC}"

# Step 5: Complete quest with photo
echo -e "${YELLOW}[5/5] Completing quest with photo...${NC}"

# Get current location (mock data for Würzburg)
LATITUDE="49.7913"
LONGITUDE="9.9534"

COMPLETE_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/quests/$QUEST_ID/complete" \
  -H "Authorization: Bearer $TOKEN" \
  -F "code=$DELIVERY_CODE" \
  -F "latitude=$LATITUDE" \
  -F "longitude=$LONGITUDE" \
  -F "photo=@$TEST_IMAGE")

echo -e "${YELLOW}Response: $COMPLETE_RESPONSE${NC}"

# Check if success
if echo "$COMPLETE_RESPONSE" | grep -q "message"; then
    echo -e "${GREEN}✅ Quest completion test PASSED!${NC}"
    echo -e "${GREEN}   Response: $COMPLETE_RESPONSE${NC}"
    rm -f "$TEST_IMAGE"
    exit 0
else
    echo -e "${RED}❌ Quest completion test FAILED!${NC}"
    echo -e "${RED}   Response: $COMPLETE_RESPONSE${NC}"
    rm -f "$TEST_IMAGE"
    exit 1
fi
