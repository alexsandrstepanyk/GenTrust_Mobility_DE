-- CreateTable
CREATE TABLE "TaskCompletion" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "questId" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "photoUrl" TEXT,
    "photoTelegramId" TEXT,
    "description" TEXT,
    "latitude" REAL,
    "longitude" REAL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedById" TEXT,
    "verifiedAt" DATETIME,
    "rejectionReason" TEXT,
    "rewardAmount" REAL,
    "rewardPaid" BOOLEAN NOT NULL DEFAULT false,
    "completedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskCompletion_questId_fkey" FOREIGN KEY ("questId") REFERENCES "Quest" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "TaskCompletion_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "TaskCompletion_verifiedById_fkey" FOREIGN KEY ("verifiedById") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
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
    "requiresPhoto" BOOLEAN NOT NULL DEFAULT true,
    "autoApprove" BOOLEAN NOT NULL DEFAULT false,
    "providerId" TEXT,
    "assigneeId" TEXT,
    "taskOrderId" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Quest_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "Provider" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quest_assigneeId_fkey" FOREIGN KEY ("assigneeId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Quest_taskOrderId_fkey" FOREIGN KEY ("taskOrderId") REFERENCES "TaskOrder" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Quest" ("assignedToChild", "assigneeId", "city", "completionLatitude", "completionLongitude", "createdAt", "deliveryCode", "description", "district", "id", "isPersonal", "location", "pickupCode", "providerId", "reward", "status", "taskOrderId", "title", "type") SELECT "assignedToChild", "assigneeId", "city", "completionLatitude", "completionLongitude", "createdAt", "deliveryCode", "description", "district", "id", "isPersonal", "location", "pickupCode", "providerId", "reward", "status", "taskOrderId", "title", "type" FROM "Quest";
DROP TABLE "Quest";
ALTER TABLE "new_Quest" RENAME TO "Quest";
CREATE UNIQUE INDEX "Quest_taskOrderId_key" ON "Quest"("taskOrderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE INDEX "TaskCompletion_questId_status_idx" ON "TaskCompletion"("questId", "status");

-- CreateIndex
CREATE INDEX "TaskCompletion_studentId_status_idx" ON "TaskCompletion"("studentId", "status");

-- CreateIndex
CREATE INDEX "TaskCompletion_status_idx" ON "TaskCompletion"("status");
