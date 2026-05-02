import prisma from "../../utils/prisma";
import Stripe from "stripe";
import config from "../../config";

const stripe = new Stripe(config.stripe_secret_key!, {
  apiVersion: "2024-06-20",
});

// ✅ Create donation + Stripe session
const createDonation = async (payload: any) => {
  const { amount, campaignId, donorId, donorName, donorEmail } = payload;

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

// ✅ Get all donations
const getAllDonations = async () => {
  return await prisma.donation.findMany({
    include: {
      campaign: true,
      donor: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
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

const getMyDonations = async (userId: string) => {
  const result = await prisma.donation.findMany({
    where: { donorId: userId ,status:'paid'},
    include: {
      campaign: {
        select: {
          id: true,
          title: true,
        },
      },
      payment: {
        select: {
          id: true,
          amount: true,
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return result;
};
export const DonationService = {
  createDonation,
  getAllDonations,
  getSingleDonation,
  getMyDonations,
};