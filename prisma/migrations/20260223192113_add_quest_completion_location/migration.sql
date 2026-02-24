-- AlterTable
ALTER TABLE "User" ADD COLUMN "language" TEXT DEFAULT 'uk';
ALTER TABLE "User" ADD COLUMN "pushToken" TEXT;

-- CreateTable
CREATE TABLE "TaskOrder" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subject" TEXT,
    "grade" TEXT,
    "budget" REAL NOT NULL,
    "city" TEXT,
    "district" TEXT,
    "location" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_MODERATION',
    "requesterId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "TaskOrder_requesterId_fkey" FOREIGN KEY ("requesterId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
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
INSERT INTO "new_Quest" ("assigneeId", "city", "createdAt", "deliveryCode", "description", "district", "id", "location", "pickupCode", "providerId", "reward", "status", "title", "type") SELECT "assigneeId", "city", "createdAt", "deliveryCode", "description", "district", "id", "location", "pickupCode", "providerId", "reward", "status", "title", "type" FROM "Quest";
DROP TABLE "Quest";
ALTER TABLE "new_Quest" RENAME TO "Quest";
CREATE UNIQUE INDEX "Quest_taskOrderId_key" ON "Quest"("taskOrderId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
