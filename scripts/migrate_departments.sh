#!/bin/bash

################################################################################
# МІГРАЦІЯ ДАНИХ З ГОЛОВНОЇ БАЗИ В БАЗИ ДЕПАРТАМЕНТІВ
# Переносить Reports з main dev.db у відповідні department БД
################################################################################

set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

PROJECT_DIR="/Users/apple/Desktop/GenTrust_Mobility_DE"
MAIN_DB="$PROJECT_DIR/prisma/dev.db"
DATABASES_DIR="$PROJECT_DIR/databases"

# Департаменти
DEPARTMENTS=("roads" "lighting" "waste" "parks" "water" "transport" "ecology" "vandalism")

echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  МІГРАЦІЯ ДАНИХ В ДЕПАРТАМЕНТИ"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Перевірка головної бази
if [ ! -f "$MAIN_DB" ]; then
    echo -e "${RED}❌${NC} Головна база не знайдена: $MAIN_DB"
    exit 1
fi

echo -e "${GREEN}✅${NC} Головна база: $MAIN_DB\n"

# Підрахунок користувачів
DB_USERS=$(sqlite3 "$MAIN_DB" "SELECT COUNT(*) FROM User;" 2>/dev/null || echo "0")
DB_REPORTS=$(sqlite3 "$MAIN_DB" "SELECT COUNT(*) FROM Report;" 2>/dev/null || echo "0")

echo -e "${YELLOW}→${NC} Користувачів в головній БД: ${GREEN}$DB_USERS${NC}"
echo -e "${YELLOW}→${NC} Звітів в головній БД: ${GREEN}$DB_REPORTS${NC}\n"

# Міграція по департаментах
TOTAL_MIGRATED=0

for dept in "${DEPARTMENTS[@]}"; do
    DEPT_DB="$DATABASES_DIR/${dept}_dept.db"
    
    if [ ! -f "$DEPT_DB" ]; then
        echo -e "${RED}❌${NC} База департаменту не знайдена: $DEPT_DB"
        echo -e "${YELLOW}→${NC} Спочатку запустіть: bash scripts/init_department_dbs.sh"
        continue
    fi
    
    echo -e "${YELLOW}→${NC} Міграція департаменту: ${GREEN}$dept${NC}..."
    
    # Отримання звітів для департаменту
    REPORTS_COUNT=$(sqlite3 "$MAIN_DB" "SELECT COUNT(*) FROM Report WHERE forwardedTo='$dept' OR (forwardedTo IS NULL AND category='$dept');" 2>/dev/null || echo "0")
    
    if [ "$REPORTS_COUNT" -eq 0 ]; then
        echo -e "  ${GREEN}✓${NC} Немає звітів для міграції"
        continue
    fi
    
    echo -e "  ${YELLOW}→${NC} Знайдено звітів: $REPORTS_COUNT"
    
    # Експорт даних з головної БД в CSV
    TEMP_CSV="/tmp/${dept}_reports_migration.csv"
    
    sqlite3 "$MAIN_DB" <<EOF
.mode csv
.headers on
.output $TEMP_CSV
SELECT 
    r.id,
    r.authorId as userId,
    COALESCE(u.firstName || ' ' || u.lastName, u.username, 'Unknown') as userName,
    COALESCE(u.email, '') as userEmail,
    r.photoId,
    '' as photoUrl,
    COALESCE(r.description, '') as description,
    r.latitude,
    r.longitude,
    COALESCE(r.aiVerdict, '') as aiVerdict,
    '' as aiConfidence,
    COALESCE(r.category, '$dept') as aiCategory,
    r.status,
    'MEDIUM' as priority,
    '' as moderatedBy,
    r.createdAt as moderatedAt,
    r.rejectionReason,
    '' as assignedTo,
    r.createdAt as startedAt,
    r.createdAt as completedAt,
    '' as completionNote,
    '' as completionPhotoId,
    r.createdAt,
    r.createdAt as updatedAt,
    CASE WHEN r.status='APPROVED' THEN r.createdAt ELSE NULL END as approvedAt
FROM Report r
LEFT JOIN User u ON r.authorId = u.id
WHERE r.forwardedTo='$dept' OR (r.forwardedTo IS NULL AND r.category='$dept');
.output stdout
EOF
    
    # Іморт даних в БД департаменту
    sqlite3 "$DEPT_DB" <<EOF
.mode csv
.import $TEMP_CSV DepartmentReport_temp
INSERT OR IGNORE INTO DepartmentReport (
    id, userId, userName, userEmail, photoId, photoUrl, description,
    latitude, longitude, aiVerdict, aiConfidence, aiCategory,
    status, priority, moderatedBy, moderatedAt, rejectionReason,
    assignedTo, startedAt, completedAt, completionNote, completionPhotoId,
    createdAt, updatedAt, approvedAt
)
SELECT 
    id, userId, userName, userEmail, photoId, photoUrl, description,
    latitude, longitude, aiVerdict, aiConfidence, aiCategory,
    status, priority, moderatedBy, moderatedAt, rejectionReason,
    assignedTo, startedAt, completedAt, completionNote, completionPhotoId,
    createdAt, updatedAt, approvedAt
FROM DepartmentReport_temp;
DROP TABLE DepartmentReport_temp;
EOF
    
    # Оновлення статистики
    PENDING=$(sqlite3 "$DEPT_DB" "SELECT COUNT(*) FROM DepartmentReport WHERE status='PENDING';")
    APPROVED=$(sqlite3 "$DEPT_DB" "SELECT COUNT(*) FROM DepartmentReport WHERE status='APPROVED';")
    REJECTED=$(sqlite3 "$DEPT_DB" "SELECT COUNT(*) FROM DepartmentReport WHERE status='REJECTED';")
    COMPLETED=$(sqlite3 "$DEPT_DB" "SELECT COUNT(*) FROM DepartmentReport WHERE status='COMPLETED';")
    TOTAL=$(sqlite3 "$DEPT_DB" "SELECT COUNT(*) FROM DepartmentReport;")
    
    TODAY=$(date +%Y-%m-%d)
    sqlite3 "$DEPT_DB" "INSERT OR REPLACE INTO DepartmentStats (id, date, totalReports, pendingReports, approvedReports, rejectedReports, completedReports, lastUpdated) VALUES ('stats_$TODAY', '$TODAY', $TOTAL, $PENDING, $APPROVED, $REJECTED, $COMPLETED, datetime('now'));"
    
    rm -f "$TEMP_CSV"
    
    echo -e "  ${GREEN}✅${NC} Мігровано: $REPORTS_COUNT звітів"
    echo -e "     Статуси: PENDING=$PENDING, APPROVED=$APPROVED, REJECTED=$REJECTED, COMPLETED=$COMPLETED"
    
    TOTAL_MIGRATED=$((TOTAL_MIGRATED + REPORTS_COUNT))
done

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║${NC}  МІГРАЦІЯ ЗАВЕРШЕНА"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅${NC} Всього мігровано звітів: ${YELLOW}$TOTAL_MIGRATED${NC}"
echo ""
echo -e "${YELLOW}→${NC} Наступні кроки:"
echo -e "  1. Перевірте дані: sqlite3 databases/roads_dept.db 'SELECT COUNT(*) FROM DepartmentReport;'"
echo -e "  2. Оновіть backend API для роботи з розділеними БД"
echo -e "  3. Запустіть систему: bash start.sh"
echo ""
