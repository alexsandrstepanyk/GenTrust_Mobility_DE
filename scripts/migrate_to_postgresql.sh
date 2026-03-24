#!/bin/bash

################################################################################
# PostgreSQL Migration Script for GenTrust Mobility
# Мігрує дані з SQLite (prisma/dev.db) на PostgreSQL (Railway/Supabase)
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
echo -e "${BLUE}║${NC}  PostgreSQL Migration Script"
echo -e "${BLUE}╚════════════════════════════════════════════════════════╝${NC}\n"

# Step 1: Check if DATABASE_URL is set
echo -e "${YELLOW}[1/6] Checking DATABASE_URL...${NC}"

if [ -f .env ]; then
    DB_URL=$(grep "^DATABASE_URL=" .env | cut -d '=' -f 2 | tr -d '"')
    if [ -z "$DB_URL" ] || [ "$DB_URL" == "file:./dev.db" ]; then
        echo -e "${YELLOW}⚠️  DATABASE_URL not set or pointing to SQLite${NC}"
        echo ""
        echo "Please provide your PostgreSQL connection string:"
        echo "Example: postgresql://user:password@host:5432/gentrust"
        echo ""
        read -p "Enter PostgreSQL URL: " NEW_DB_URL
        
        # Update .env
        if grep -q "^DATABASE_URL=" .env; then
            sed -i.bak "s|^DATABASE_URL=.*|DATABASE_URL=\"$NEW_DB_URL\"|" .env
            rm .env.bak 2>/dev/null || true
        else
            echo "DATABASE_URL=\"$NEW_DB_URL\"" >> .env
        fi
        
        DB_URL="$NEW_DB_URL"
        echo -e "${GREEN}✅ DATABASE_URL updated${NC}"
    else
        echo -e "${GREEN}✅ DATABASE_URL found${NC}"
    fi
else
    echo -e "${RED}❌ .env file not found!${NC}"
    exit 1
fi

# Step 2: Backup SQLite database
echo -e "${YELLOW}[2/6] Creating SQLite backup...${NC}"
BACKUP_FILE="prisma/dev.db.backup.$(date +%Y%m%d_%H%M%S)"
cp prisma/dev.db "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup created: $BACKUP_FILE${NC}"

# Step 3: Update Prisma schema to PostgreSQL
echo -e "${YELLOW}[3/6] Updating Prisma schema to PostgreSQL...${NC}"

# Create backup of original schema
cp prisma/schema.prisma prisma/schema.prisma.sqlite.bak

# Replace sqlite with postgresql
sed -i.bak 's/provider = "sqlite"/provider = "postgresql"/g' prisma/schema.prisma
sed -i.bak 's|url = "file:./dev.db"|url = env("DATABASE_URL")|g' prisma/schema.prisma
rm prisma/schema.prisma.bak 2>/dev/null || true

echo -e "${GREEN}✅ Schema updated to PostgreSQL${NC}"

# Step 4: Generate Prisma Client for PostgreSQL
echo -e "${YELLOW}[4/6] Generating Prisma Client for PostgreSQL...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"

# Step 5: Run migrations
echo -e "${YELLOW}[5/6] Running database migrations...${NC}"
npx prisma migrate dev --name postgresql_migration

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Migrations completed successfully${NC}"
else
    echo -e "${RED}❌ Migration failed! Restoring SQLite schema...${NC}"
    cp prisma/schema.prisma.sqlite.bak prisma/schema.prisma
    exit 1
fi

# Step 6: Seed initial data (optional)
echo -e "${YELLOW}[6/6] Seeding initial data...${NC}"
echo "Do you want to seed the database with test data? (y/n)"
read -p "> " answer

if [ "$answer" == "y" ] || [ "$answer" == "Y" ]; then
    # Check if seed script exists
    if [ -f "scripts/seed_quests.ts" ]; then
        npx ts-node scripts/seed_quests.ts
        echo -e "${GREEN}✅ Database seeded${NC}"
    else
        echo -e "${YELLOW}⚠️  Seed script not found${NC}"
    fi
fi

# Final status
echo -e "\n${GREEN}╔════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║${NC}  PostgreSQL Migration Completed Successfully!"
echo -e "${GREEN}╚════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${YELLOW}Summary:${NC}"
echo -e "   • Backup: $BACKUP_FILE"
echo -e "   • New DB: PostgreSQL (see DATABASE_URL in .env)"
echo -e "   • Schema: prisma/schema.prisma (updated)"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "   1. Test the connection: curl http://localhost:3000/health"
echo -e "   2. Restart the backend: killall node && npm run api"
echo -e "   3. Check logs: tail -f /tmp/BackendAPIv6.log"
echo ""

# Restore SQLite schema for development (optional)
echo -e "${YELLOW}Would you like to restore SQLite schema for local development? (y/n)${NC}"
read -p "> " restore

if [ "$restore" == "y" ] || [ "$restore" == "Y" ]; then
    cp prisma/schema.prisma.sqlite.bak prisma/schema.prisma
    npx prisma generate
    echo -e "${GREEN}✅ SQLite schema restored${NC}"
    echo -e "${YELLOW}Note: Set DATABASE_URL back to PostgreSQL when deploying${NC}"
fi

# Cleanup
rm -f prisma/schema.prisma.sqlite.bak

echo -e "\n${GREEN}✅ Migration script completed!${NC}"
