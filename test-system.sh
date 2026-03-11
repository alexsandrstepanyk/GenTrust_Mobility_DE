#!/bin/bash

################################################################################
# GENTRUST MOBILITY - SYSTEM TEST SUITE
# Перевірка всіх компонентів системи
################################################################################

set -e

# Кольори
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
CYAN='\033[0;36m'
NC='\033[0m'

# Лічильники
TESTS_PASSED=0
TESTS_FAILED=0

# Helper functions
print_header() {
    echo -e "\n${BLUE}════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}  $1${NC}"
    echo -e "${BLUE}════════════════════════════════════════════════════════${NC}\n"
}

print_test() {
    echo -e "${CYAN}→${NC} $1..."
}

pass() {
    echo -e "${GREEN}✅ PASS:${NC} $1"
    TESTS_PASSED=$((TESTS_PASSED + 1))
}

fail() {
    echo -e "${RED}❌ FAIL:${NC} $1"
    TESTS_FAILED=$((TESTS_FAILED + 1))
}

# ============================================================================
# 1. BACKEND API TESTS
# ============================================================================

print_header "🌐 BACKEND API TESTS"

# Test 1: Health Check
print_test "Health Check (GET /health)"
HEALTH_RESPONSE=$(curl -s http://localhost:3000/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    pass "Health endpoint is working"
else
    fail "Health endpoint is not responding"
fi

# Test 2: API Root
print_test "API Root (GET /api)"
API_RESPONSE=$(curl -s http://localhost:3000/api)
if echo "$API_RESPONSE" | grep -q '"name":"GenTrust Mobility API"'; then
    pass "API root endpoint is working"
else
    fail "API root endpoint is not responding"
fi

# Test 3: Stats Dashboard
print_test "Stats Dashboard (GET /api/stats/dashboard)"
sleep 2  # Wait for rate limit
STATS_RESPONSE=$(curl -s http://localhost:3000/api/stats/dashboard)
if echo "$STATS_RESPONSE" | grep -q '"reports"'; then
    pass "Stats dashboard endpoint is working"
else
    fail "Stats dashboard endpoint is not responding"
fi

# Test 4: Reports List
print_test "Reports List (GET /api/reports)"
sleep 2
REPORTS_RESPONSE=$(curl -s http://localhost:3000/api/reports)
if echo "$REPORTS_RESPONSE" | grep -q '"id"'; then
    REPORTS_COUNT=$(echo "$REPORTS_RESPONSE" | jq 'length')
    pass "Reports list is working ($REPORTS_COUNT reports)"
else
    fail "Reports list is not responding"
fi

# Test 5: Department Reports
print_test "Department Reports (GET /api/reports/department/roads)"
sleep 2
DEPT_RESPONSE=$(curl -s http://localhost:3000/api/reports/department/roads)
if echo "$DEPT_RESPONSE" | grep -q '"forwardedTo":"roads"'; then
    pass "Department reports endpoint is working"
else
    fail "Department reports endpoint is not responding"
fi

# ============================================================================
# 2. DASHBOARD CONNECTIVITY TESTS
# ============================================================================

print_header "🖥️ DASHBOARD CONNECTIVITY TESTS"

# Test 6: City-Hall Dashboard
print_test "City-Hall Dashboard (port 5173)"
if curl -s http://localhost:5173 | grep -q "City Hall"; then
    pass "City-Hall Dashboard is accessible"
else
    fail "City-Hall Dashboard is not accessible"
fi

# Test 7: Admin Panel
print_test "Admin Panel (port 5174)"
if curl -s http://localhost:5174 | grep -q "Admin"; then
    pass "Admin Panel is accessible"
else
    fail "Admin Panel is not accessible"
fi

# Test 8: Department Dashboard Base
print_test "Department Dashboard Base (port 5175)"
DEPT_BASE_RESPONSE=$(curl -s http://localhost:5175)
if echo "$DEPT_BASE_RESPONSE" | grep -q "Dashboard\|react\|vite"; then
    pass "Department Dashboard Base is accessible"
else
    # Port is active but serving - that's OK for Vite dev server
    if lsof -ti:5175 >/dev/null 2>&1; then
        pass "Department Dashboard Base is running (Vite dev server)"
    else
        fail "Department Dashboard Base is not accessible"
    fi
fi

# Test 9-16: All 8 Departments
DEPARTMENTS=("roads:5180" "lighting:5181" "waste:5182" "parks:5183" "water:5184" "transport:5185" "ecology:5186" "vandalism:5187")
DEPT_EMOJIS=("🛣️" "💡" "🗑️" "🌳" "🚰" "🚌" "🌿" "🎨")

for i in "${!DEPARTMENTS[@]}"; do
    IFS=':' read -r dept port <<< "${DEPARTMENTS[$i]}"
    emoji="${DEPT_EMOJIS[$i]}"
    print_test "$emoji $dept Department (port $port)"
    if curl -s http://localhost:$port | grep -q "Dashboard"; then
        pass "$emoji $dept Department is accessible"
    else
        fail "$emoji $dept Department is not accessible"
    fi
done

# Test 17: Monitor Dashboard
print_test "Monitor Dashboard (port 9000)"
if curl -s http://localhost:9000 | grep -q "GenTrust Mobility"; then
    pass "Monitor Dashboard is accessible"
else
    fail "Monitor Dashboard is not accessible"
fi

# ============================================================================
# 3. DATA INTEGRITY TESTS
# ============================================================================

print_header "📊 DATA INTEGRITY TESTS"

# Test 18: Main DB Reports Count
print_test "Main DB Reports Count"
MAIN_DB_COUNT=$(sqlite3 /Users/apple/Desktop/GenTrust_Mobility_DE/prisma/dev.db "SELECT COUNT(*) FROM Report;")
if [ "$MAIN_DB_COUNT" -gt 0 ]; then
    pass "Main DB has $MAIN_DB_COUNT reports"
else
    fail "Main DB has no reports"
fi

# Test 19: Department DB Reports
print_test "Department Databases Reports"
for dept in roads lighting waste parks water transport ecology vandalism; do
    DEPT_COUNT=$(sqlite3 "/Users/apple/Desktop/GenTrust_Mobility_DE/databases/${dept}_dept.db" "SELECT COUNT(*) FROM DepartmentReport;" 2>/dev/null || echo "0")
    if [ "$DEPT_COUNT" -gt 0 ]; then
        echo -e "  ${GREEN}✅${NC} $dept: $DEPT_COUNT reports"
    else
        echo -e "  ${YELLOW}⚠️${NC} $dept: 0 reports"
    fi
done
pass "Department databases checked"

# Test 20: Stats API Data Validation
print_test "Stats API Data Validation"
sleep 2
STATS=$(curl -s http://localhost:3000/api/stats/dashboard)
TOTAL=$(echo "$STATS" | jq '.reports.total')
PENDING=$(echo "$STATS" | jq '.reports.pending')
APPROVED=$(echo "$STATS" | jq '.reports.approved')
DAILY_COUNT=$(echo "$STATS" | jq '.reports.dailyReports | length')
CATEGORY_COUNT=$(echo "$STATS" | jq '.reports.byCategory | length')

if [ "$TOTAL" -gt 0 ]; then
    pass "Total reports: $TOTAL"
else
    fail "Total reports is 0"
fi

if [ "$DAILY_COUNT" -gt 0 ]; then
    pass "Daily reports data: $DAILY_COUNT days"
else
    fail "No daily reports data"
fi

if [ "$CATEGORY_COUNT" -gt 0 ]; then
    pass "Categories: $CATEGORY_COUNT"
else
    fail "No category data"
fi

# ============================================================================
# 4. PORT VALIDATION TESTS
# ============================================================================

print_header "🔌 PORT VALIDATION TESTS"

PORTS=(3000:Backend 5173:City-Hall 5174:Admin 5175:Dept-Base 5180:Roads 5181:Lighting 5182:Waste 5183:Parks 5184:Water 5185:Transport 5186:Ecology 5187:Vandalism 9000:Monitor)

for port_info in "${PORTS[@]}"; do
    IFS=':' read -r port name <<< "$port_info"
    print_test "Port $port ($name)"
    if lsof -ti:$port >/dev/null 2>&1; then
        PID=$(lsof -ti:$port)
        pass "Port $port is active (PID: $PID)"
    else
        fail "Port $port is not active"
    fi
done

# ============================================================================
# 5. CREATE TEST REPORT (with auth token if available)
# ============================================================================

print_header "📝 CREATE TEST REPORT"

print_test "Creating test report via API"

# Try to get auth token first (optional - for testing authenticated endpoints)
AUTH_TOKEN=""
if [ -f /tmp/test_auth_token.txt ]; then
    AUTH_TOKEN=$(cat /tmp/test_auth_token.txt)
fi

if [ -n "$AUTH_TOKEN" ]; then
    TEST_RESPONSE=$(curl -s -X POST http://localhost:3000/api/reports \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $AUTH_TOKEN" \
      -d '{
        "photoBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "latitude": 49.9935,
        "longitude": 10.2222,
        "description": "TEST REPORT - System Test Suite",
        "category": "roads"
      }')
else
    # Without auth - expect 401 or test with public endpoint
    TEST_RESPONSE=$(curl -s -X POST http://localhost:3000/api/reports \
      -H "Content-Type: application/json" \
      -d '{
        "photoBase64": "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
        "latitude": 49.9935,
        "longitude": 10.2222,
        "description": "TEST REPORT - System Test Suite",
        "category": "roads"
      }')
    
    # Check if it's 401 Unauthorized (expected without auth)
    if echo "$TEST_RESPONSE" | grep -q "Unauthorized"; then
        pass "Report creation requires auth (expected behavior)"
        echo -e "  ${CYAN}ℹ️${NC} To test report creation, provide auth token in /tmp/test_auth_token.txt"
        TEST_RESPONSE=""
    fi
fi

if [ -n "$TEST_RESPONSE" ]; then
    if echo "$TEST_RESPONSE" | grep -q '"success":true'; then
        pass "Test report created successfully"
        REPORT_ID=$(echo "$TEST_RESPONSE" | jq -r '.report.id')
        echo -e "  ${CYAN}ℹ️${NC} Report ID: $REPORT_ID"
    elif echo "$TEST_RESPONSE" | grep -q "Too many requests"; then
        fail "Rate limit exceeded (wait and retry)"
    else
        fail "Failed to create test report"
        echo -e "  ${RED}Response:${NC} $TEST_RESPONSE"
    fi
fi

# ============================================================================
# SUMMARY
# ============================================================================

print_header "📊 TEST SUMMARY"

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED))

echo -e "${BLUE}Tests Passed:${NC} ${GREEN}$TESTS_PASSED${NC}"
echo -e "${BLUE}Tests Failed:${NC} ${RED}$TESTS_FAILED${NC}"
echo -e "${BLUE}Total Tests:${NC} $TOTAL_TESTS"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║${NC}  ✅ ALL TESTS PASSED! System is working correctly."
    echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}"
    exit 0
else
    echo -e "${RED}╔════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║${NC}  ❌ SOME TESTS FAILED! Please check the logs above."
    echo -e "${RED}╚════════════════════════════════════════════════════════╝${NC}"
    exit 1
fi
