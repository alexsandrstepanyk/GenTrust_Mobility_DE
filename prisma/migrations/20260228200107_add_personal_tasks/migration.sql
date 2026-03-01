-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_PersonalTask" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "reward" REAL,
    "audience" TEXT NOT NULL DEFAULT 'PERSONAL',
    "assignedChildId" TEXT,
    "dueDate" DATETIME,
    "completedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "PersonalTask_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_PersonalTask" ("completedAt", "createdAt", "creatorId", "description", "dueDate", "id", "reward", "status", "title", "updatedAt") SELECT "completedAt", "createdAt", "creatorId", "description", "dueDate", "id", "reward", "status", "title", "updatedAt" FROM "PersonalTask";
DROP TABLE "PersonalTask";
ALTER TABLE "new_PersonalTask" RENAME TO "PersonalTask";
CREATE INDEX "PersonalTask_creatorId_audience_idx" ON "PersonalTask"("creatorId", "audience");
CREATE INDEX "PersonalTask_assignedChildId_idx" ON "PersonalTask"("assignedChildId");
CREATE TABLE "new_Quest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'Завдання',
    "description" TEXT,
    "type" TEXT NOT NULL DEFAULT 'LOGISTICS',
    "status" TEXT NOT NULL DEFAULT 'OPEN',
    "reward" REAL NOT NULL,
    "city" TEXT,
    "district" TEXT,
    "location" TEXT,
    "isPersonal" BOOLEAN NOT NULL DEFAULT false,
    "assignedToChild" TEXT,
    "pickupCode" TEXT,
    "deliveryCode" TEXT,
    "completionLatitude" REAL,
    "completionLongitude" REAL,
    "providerId" TEXT,
    "assigneeId" TEXT,
    "taskOrderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Quest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quest_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quest_taskOrderId_fkey" FOREIGN KEY ("taskOrderId") REFERENCES "TaskOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Quest" ("assigneeId", "city", "completionLatitude", "completionLongitude", "createdAt", "deliveryCode", "description", "district", "id", "location", "pickupCode", "providerId", "reward", "status", "taskOrderId", "title", "type") SELECT "assigneeId", "city", "completionLatitude", "completionLongitude", "createdAt", "deliveryCode", "description", "district", "id", "location", "pickupCode", "providerId", "reward", "status", "taskOrderId", "title", "type" FROM "Quest";
DROP TABLE "Quest";
ALTER TABLE "new_Quest" RENAME TO "Quest";
CREATE UNIQUE INDEX "Quest_taskOrderId_key" ON "Quest"("taskOrderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
