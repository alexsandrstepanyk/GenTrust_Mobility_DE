-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "telegramId" BIGINT,
    "email" TEXT,
    "passwordHash" TEXT,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "birthDate" TEXT,
    "school" TEXT,
    "grade" TEXT,
    "role" TEXT NOT NULL DEFAULT 'SCOUT',
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "dignityScore" INTEGER NOT NULL DEFAULT 50,
    "balance" REAL NOT NULL DEFAULT 0.0,
    "district" TEXT,
    "city" TEXT,
    "country" TEXT DEFAULT 'DE',
    "urbanBanExpiresAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("balance", "birthDate", "city", "createdAt", "dignityScore", "district", "firstName", "grade", "id", "lastName", "role", "school", "status", "telegramId", "updatedAt", "urbanBanExpiresAt", "username") SELECT "balance", "birthDate", "city", "createdAt", "dignityScore", "district", "firstName", "grade", "id", "lastName", "role", "school", "status", "telegramId", "updatedAt", "urbanBanExpiresAt", "username" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_telegramId_key" ON "User"("telegramId");
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
