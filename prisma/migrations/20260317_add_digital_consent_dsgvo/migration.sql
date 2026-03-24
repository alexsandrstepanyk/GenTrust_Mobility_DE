-- CreateTable
CREATE TABLE "DigitalConsent" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "parentId" TEXT NOT NULL,
    "childId" TEXT NOT NULL,
    "consentText" TEXT NOT NULL,
    "consentVersion" TEXT NOT NULL DEFAULT '1.0.0',
    "language" TEXT NOT NULL DEFAULT 'de',
    "signatureHash" TEXT NOT NULL,
    "ipAddress" TEXT NOT NULL,
    "userAgent" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "revokedAt" DATETIME,
    "revokedBy" TEXT,
    "revokeReason" TEXT,
    "signedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" DATETIME,
    "reviewedAt" DATETIME,
    "pdfUrl" TEXT,
    "telegramNotified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "DigitalConsent_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "DigitalConsent_childId_fkey" FOREIGN KEY ("childId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "DigitalConsent_parentId_status_idx" ON "DigitalConsent"("parentId", "status");

-- CreateIndex
CREATE INDEX "DigitalConsent_childId_status_idx" ON "DigitalConsent"("childId", "status");

-- CreateIndex
CREATE INDEX "DigitalConsent_status_idx" ON "DigitalConsent"("status");
