/*
  Warnings:

  - The values [rejected,paused] on the enum `CampaignStatus` will be removed. If these variants are still used in the database, this will fail.
  - The values [MODERATOR] on the enum `Role` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `charityId` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `gallery` on the `Campaign` table. All the data in the column will be lost.
  - You are about to drop the column `campaignId` on the `ItemDonation` table. All the data in the column will be lost.
  - The `status` column on the `ItemDonation` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - You are about to drop the column `address` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `emailVerified` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isActive` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `isBlocked` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `lastLoginAt` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `CampaignAcceptedItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CampaignDonor` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `CampaignUpdate` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Charity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `HeroBanner` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MoneyDonation` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Notification` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Pickup` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Review` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "PickupStatus" AS ENUM ('pending', 'assigned', 'picked_up', 'delivered', 'cancelled');

-- AlterEnum
BEGIN;
CREATE TYPE "CampaignStatus_new" AS ENUM ('pending', 'active', 'verified', 'closed');
ALTER TABLE "Campaign" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Campaign" ALTER COLUMN "status" TYPE "CampaignStatus_new" USING ("status"::text::"CampaignStatus_new");
ALTER TYPE "CampaignStatus" RENAME TO "CampaignStatus_old";
ALTER TYPE "CampaignStatus_new" RENAME TO "CampaignStatus";
DROP TYPE "CampaignStatus_old";
ALTER TABLE "Campaign" ALTER COLUMN "status" SET DEFAULT 'pending';
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "Role_new" AS ENUM ('USER', 'ADMIN', 'VOLUNTEER');
ALTER TABLE "User" ALTER COLUMN "role" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "role" TYPE "Role_new" USING ("role"::text::"Role_new");
ALTER TYPE "Role" RENAME TO "Role_old";
ALTER TYPE "Role_new" RENAME TO "Role";
DROP TYPE "Role_old";
ALTER TABLE "User" ALTER COLUMN "role" SET DEFAULT 'USER';
COMMIT;

-- DropForeignKey
ALTER TABLE "Campaign" DROP CONSTRAINT "Campaign_charityId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignAcceptedItem" DROP CONSTRAINT "CampaignAcceptedItem_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignDonor" DROP CONSTRAINT "CampaignDonor_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "CampaignUpdate" DROP CONSTRAINT "CampaignUpdate_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Charity" DROP CONSTRAINT "Charity_ownerId_fkey";

-- DropForeignKey
ALTER TABLE "ItemDonation" DROP CONSTRAINT "ItemDonation_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "ItemDonation" DROP CONSTRAINT "ItemDonation_donorId_fkey";

-- DropForeignKey
ALTER TABLE "MoneyDonation" DROP CONSTRAINT "MoneyDonation_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "MoneyDonation" DROP CONSTRAINT "MoneyDonation_donorId_fkey";

-- DropForeignKey
ALTER TABLE "Notification" DROP CONSTRAINT "Notification_userId_fkey";

-- DropForeignKey
ALTER TABLE "Pickup" DROP CONSTRAINT "Pickup_itemDonationId_fkey";

-- DropForeignKey
ALTER TABLE "Pickup" DROP CONSTRAINT "Pickup_volunteerId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_campaignId_fkey";

-- DropForeignKey
ALTER TABLE "Review" DROP CONSTRAINT "Review_userId_fkey";

-- DropIndex
DROP INDEX "User_email_idx";

-- DropIndex
DROP INDEX "User_phone_key";

-- AlterTable
ALTER TABLE "Campaign" DROP COLUMN "charityId",
DROP COLUMN "gallery",
ADD COLUMN     "acceptedItems" TEXT[],
ADD COLUMN     "updates" JSONB,
ALTER COLUMN "tags" SET DEFAULT ARRAY[]::TEXT[];

-- AlterTable
ALTER TABLE "ItemDonation" DROP COLUMN "campaignId",
DROP COLUMN "status",
ADD COLUMN     "status" "PickupStatus" NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE "User" DROP COLUMN "address",
DROP COLUMN "emailVerified",
DROP COLUMN "isActive",
DROP COLUMN "isBlocked",
DROP COLUMN "lastLoginAt";

-- DropTable
DROP TABLE "CampaignAcceptedItem";

-- DropTable
DROP TABLE "CampaignDonor";

-- DropTable
DROP TABLE "CampaignUpdate";

-- DropTable
DROP TABLE "Charity";

-- DropTable
DROP TABLE "HeroBanner";

-- DropTable
DROP TABLE "MoneyDonation";

-- DropTable
DROP TABLE "Notification";

-- DropTable
DROP TABLE "Pickup";

-- DropTable
DROP TABLE "Review";

-- DropEnum
DROP TYPE "ItemDonationStatus";

-- DropEnum
DROP TYPE "NotificationType";

-- CreateTable
CREATE TABLE "Donation" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "transactionId" TEXT NOT NULL,
    "donorName" TEXT NOT NULL,
    "donorEmail" TEXT,
    "anonymous" BOOLEAN NOT NULL DEFAULT false,
    "status" "DonationStatus" NOT NULL DEFAULT 'pending',
    "campaignId" TEXT NOT NULL,
    "donorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Donation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Donation_transactionId_key" ON "Donation"("transactionId");

-- CreateIndex
CREATE INDEX "Campaign_creatorId_idx" ON "Campaign"("creatorId");

-- CreateIndex
CREATE INDEX "Campaign_slug_idx" ON "Campaign"("slug");

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Donation" ADD CONSTRAINT "Donation_donorId_fkey" FOREIGN KEY ("donorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
