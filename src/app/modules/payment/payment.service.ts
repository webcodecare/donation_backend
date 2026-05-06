import Stripe from "stripe";
import prisma from "../../utils/prisma";
import config from "../../config";

const stripe = new Stripe(config.stripe_secret_key!, {
  apiVersion: "2025-08-27.basil",
});

// ✅ Create checkout session
const createCheckoutSession = async (payload: any) => {
  const { amount, donorName, donorEmail, campaignId, donorId } = payload;

  // 1. Create pending donation/payment record
  const donation = await prisma.donation.create({
    data: {
      amount,
      donorName,
      donorEmail,
      campaignId,
      donorId: donorId || null,
      status: "pending",
      transactionId: "temp_" + Date.now(),
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

const confirmPayment = async (sessionId: string) => {
  const session = await stripe.checkout.sessions.retrieve(sessionId);

  if (session.payment_status !== "paid") {
    throw new Error("Payment not completed");
  }

  const donationId = session.metadata?.donationId;
  if (!donationId) {
    throw new Error("Donation ID missing");
  }

  const stripePaymentId = session.payment_intent as string;

  try {
    const result = await prisma.$transaction(async (tx) => {
      // ✅ 1. check donation already paid
      const existingDonation = await tx.donation.findUnique({
        where: { id: donationId },
      });

      if (existingDonation?.status === "paid") {
        return {
          donation: existingDonation,
          alreadyProcessed: true,
        };
      }

      // ✅ 2. create payment (unique protected)
      const payment = await tx.payment.create({
        data: {
          amount: session.amount_total!,
          currency: session.currency!,
          stripePaymentId,
          status: "paid",
          donationId,
        },
      });

      // ✅ 3. update donation
      const donation = await tx.donation.update({
        where: { id: donationId },
        data: {
          status: "paid",
          transactionId: stripePaymentId,
        },
      });

      // ✅ 4. update campaign
      await tx.campaign.update({
        where: { id: donation.campaignId },
        data: {
          collectedAmount: { increment: donation.amount },
          contributor: { increment: 1 },
        },
      });

      return {
        donation,
        alreadyProcessed: false,
      };
    });

    return {
      success: true,
      ...result,
    };
  } catch (error: any) {
    // 🔥 HANDLE UNIQUE ERROR (final safety)
    if (error.code === "P2002") {
      return {
        success: true,
        message: "Already processed",
        alreadyProcessed: true,
      };
    }

    throw error;
  }
};
export const paymentService = {
  createCheckoutSession,
  confirmPayment,
};