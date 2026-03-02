#!/bin/bash
# Test Socket.IO Notifications System
# Send a test report to trigger notification

echo "🧪 Testing Socket.IO Notifications System..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Default user token (admin user)
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NWRiYzQzMDY2YjdhNjMzY2ZmMDAwMDEiLCJpYXQiOjE3MDkxMzYwMDAsImV4cCI6OTk5OTk5OTk5OX0.XXXXXXX"

# Test with actual user from database
echo -e "${BLUE}1️⃣ Fetching test user...${NC}"
USER_ID=$(curl -s http://localhost:3000/api/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" | jq -r '.users[0].id' 2>/dev/null)

if [ -z "$USER_ID" ] || [ "$USER_ID" == "null" ]; then
  echo -e "${YELLOW}⚠️  Could not fetch user, using admin ID${NC}"
  USER_ID="admin"
fi

echo -e "${GREEN}✅ User ID: $USER_ID${NC}\n"

# Create test photo (1x1 transparent PNG)
TEST_PHOTO="iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

# Send test report
echo -e "${BLUE}2️⃣ Sending test report...${NC}"
RESPONSE=$(curl -s -X POST http://localhost:3000/api/reports \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"photoBase64\": \"$TEST_PHOTO\",
    \"latitude\": 52.52,
    \"longitude\": 13.405,
    \"description\": \"🧪 Test notification from script\",
    \"category\": \"Roads\"
  }")

echo -e "${GREEN}Response:${NC}"
echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"

echo ""
echo -e "${GREEN}✅ Report sent!${NC}"
echo -e "${BLUE}3️⃣ Check City Hall Dashboard - bell icon should now have a badge!${NC}"
echo -e "${YELLOW}   URL: http://localhost:5175${NC}"
echo ""
echo -e "${YELLOW}📊 Expected behavior:${NC}"
echo "   1. Bell icon shows '1' badge"
echo "   2. Click bell to see notification dropdown"
echo "   3. Notification shows: Roads | Test notification from script"
echo "   4. Click 'Mark all as read' to clear badge"
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
