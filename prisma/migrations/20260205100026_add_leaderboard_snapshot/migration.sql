-- CreateTable
CREATE TABLE "LeaderboardSnapshot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "dignityScore" INTEGER NOT NULL,
    "city" TEXT,
    "district" TEXT,
    "school" TEXT,
    "rank" INTEGER NOT NULL,
    "snapshotDate" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_snapshotDate_rank_idx" ON "LeaderboardSnapshot"("snapshotDate", "rank");

-- CreateIndex
CREATE INDEX "LeaderboardSnapshot_userId_snapshotDate_idx" ON "LeaderboardSnapshot"("userId", "snapshotDate");
