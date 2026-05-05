-- AlterEnum
ALTER TYPE "CampaignStatus" ADD VALUE 'completed';

-- AlterTable
ALTER TABLE "Campaign"
  ADD COLUMN "successStory"  TEXT,
  ADD COLUMN "successImages" TEXT[] DEFAULT ARRAY[]::TEXT[],
  ADD COLUMN "completedAt"   TIMESTAMP(3);

-- AlterTable
ALTER TABLE "CampaignTranslation"
  ADD COLUMN "successStory" TEXT;
