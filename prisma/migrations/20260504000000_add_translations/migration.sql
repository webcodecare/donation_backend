-- CreateTable
CREATE TABLE "BannerTranslation" (
    "id" TEXT NOT NULL,
    "bannerId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "short_title" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BannerTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignTranslation" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "story" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CharityTranslation" (
    "id" TEXT NOT NULL,
    "charityId" TEXT NOT NULL,
    "lang" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "mission" TEXT,
    "description" TEXT NOT NULL,
    "address" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharityTranslation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BannerTranslation_lang_idx" ON "BannerTranslation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "BannerTranslation_bannerId_lang_key" ON "BannerTranslation"("bannerId", "lang");

-- CreateIndex
CREATE INDEX "CampaignTranslation_lang_idx" ON "CampaignTranslation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignTranslation_campaignId_lang_key" ON "CampaignTranslation"("campaignId", "lang");

-- CreateIndex
CREATE INDEX "CharityTranslation_lang_idx" ON "CharityTranslation"("lang");

-- CreateIndex
CREATE UNIQUE INDEX "CharityTranslation_charityId_lang_key" ON "CharityTranslation"("charityId", "lang");

-- AddForeignKey
ALTER TABLE "BannerTranslation" ADD CONSTRAINT "BannerTranslation_bannerId_fkey" FOREIGN KEY ("bannerId") REFERENCES "Banner"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignTranslation" ADD CONSTRAINT "CampaignTranslation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CharityTranslation" ADD CONSTRAINT "CharityTranslation_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "Charity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
