-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('pending', 'responded', 'resolved', 'archived');

-- CreateTable
CREATE TABLE "CharityInquiry" (
    "id" TEXT NOT NULL,
    "charityId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" "InquiryStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CharityInquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CharityInquiry_charityId_idx" ON "CharityInquiry"("charityId");

-- CreateIndex
CREATE INDEX "CharityInquiry_status_idx" ON "CharityInquiry"("status");

-- CreateIndex
CREATE INDEX "CharityInquiry_createdAt_idx" ON "CharityInquiry"("createdAt");

-- AddForeignKey
ALTER TABLE "CharityInquiry" ADD CONSTRAINT "CharityInquiry_charityId_fkey" FOREIGN KEY ("charityId") REFERENCES "Charity"("id") ON DELETE CASCADE ON UPDATE CASCADE;
