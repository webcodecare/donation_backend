-- AlterTable
ALTER TABLE "Campaign"
  ADD COLUMN "icons" TEXT[] DEFAULT ARRAY[]::TEXT[];
