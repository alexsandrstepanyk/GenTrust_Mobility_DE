-- AlterTable
ALTER TABLE "Quest" ADD COLUMN "deliveryCode" TEXT;
ALTER TABLE "Quest" ADD COLUMN "pickupCode" TEXT;

-- AlterTable
ALTER TABLE "User" ADD COLUMN "birthDate" TEXT;
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "grade" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;
ALTER TABLE "User" ADD COLUMN "school" TEXT;
