import prisma from "../../utils/prisma";
import Stripe from "stripe";
import config from "../../config";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";

const stripe = new Stripe(config.stripe_secret_key!, {
  apiVersion: "2025-08-27.basil",
});

// ✅ Create donation + Stripe session
const createDonation = async (payload: any) => {
  const { amount, campaignId, donorId, donorName, donorEmail } = payload;

  // Block donations to completed (or closed) campaigns
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { id: true, status: true, goalAmount: true },
  });
  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, "Campaign not found");
  }
  if (campaign.status === "completed") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This campaign has been successfully completed and is no longer accepting donations."
    );
  }
  if (campaign.status === "closed") {
    throw new AppError(httpStatus.BAD_REQUEST, "This campaign is closed.");
  }
  if (!campaign.goalAmount || campaign.goalAmount <= 0) {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This campaign accepts item donations only."
    );
  }

  // 1. Create pending donation
  const donation = await prisma.donation.create({
    data: {
      amount,
      transactionId: "temp_" + Date.now(),
      donorName,
      donorEmail,
      anonymous: payload.anonymous || false,
      campaignId,
      donorId: donorId || null,
      status: "pending",
    },
  });

  // 2. Create Stripe session
  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    mode: "payment",
    line_items: [
      {
        price_data: {
          currency: "usd",
          product_data: {
            name: "Campaign Donation",
          },
          unit_amount: Math.round(amount * 100),
        },
        quantity: 1,
      },
    ],
    metadata: {
      donationId: donation.id,
    },
    success_url: `${config.client_url}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${config.client_url}/donation/cancel`,
  });

  return {
    donation,
    url: session.url,
  };
};

// ✅ Get all donations (admin) — paginated + searchable
const getAllDonations = async (
  pagination: { page: number; limit: number; skip: number; search: string }
) => {
  const { page, limit, skip, search } = pagination;
  const where: any = { status: "paid" };
  if (search) {
    where.OR = [
      { donorName: { contains: search, mode: "insensitive" as const } },
      { donorEmail: { contains: search, mode: "insensitive" as const } },
      { transactionId: { contains: search, mode: "insensitive" as const } },
      { campaign: { title: { contains: search, mode: "insensitive" as const } } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.donation.findMany({
      where,
      include: { donor: true, payment: true, campaign: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.donation.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

// ✅ Get single donation
const getSingleDonation = async (id: string) => {
  return await prisma.donation.findUnique({
    where: { id },
    include: {
      campaign: true,
      donor: true,
      payment: true,
    },
  });
};

const getMyDonations = async (
  userId: string,
  pagination: { page: number; limit: number; skip: number; search: string }
) => {
  const { page, limit, skip, search } = pagination;
  const where: any = { donorId: userId, status: "paid" };
  if (search) {
    where.OR = [
      { transactionId: { contains: search, mode: "insensitive" as const } },
      { campaign: { title: { contains: search, mode: "insensitive" as const } } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.donation.findMany({
      where,
      include: {
        campaign: { select: { id: true, title: true } },
        payment: { select: { id: true, amount: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.donation.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};
export const DonationService = {
  createDonation,
  getAllDonations,
  getSingleDonation,
  getMyDonations,
};