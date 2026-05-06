"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const stripe_1 = __importDefault(require("stripe"));
const config_1 = __importDefault(require("../../config"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const stripe = new stripe_1.default(config_1.default.stripe_secret_key, {
    apiVersion: "2025-08-27.basil",
});
// ✅ Create donation + Stripe session
const createDonation = async (payload) => {
    const { amount, campaignId, donorId, donorName, donorEmail } = payload;
    // Block donations to completed (or closed) campaigns
    const campaign = await prisma_1.default.campaign.findUnique({
        where: { id: campaignId },
        select: { id: true, status: true, goalAmount: true },
    });
    if (!campaign) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Campaign not found");
    }
    if (campaign.status === "completed") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This campaign has been successfully completed and is no longer accepting donations.");
    }
    if (campaign.status === "closed") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This campaign is closed.");
    }
    if (!campaign.goalAmount || campaign.goalAmount <= 0) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This campaign accepts item donations only.");
    }
    // 1. Create pending donation
    const donation = await prisma_1.default.donation.create({
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
        success_url: `${config_1.default.client_url}/donation/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${config_1.default.client_url}/donation/cancel`,
    });
    return {
        donation,
        url: session.url,
    };
};
// ✅ Get all donations (admin) — paginated + searchable
const getAllDonations = async (pagination) => {
    const { page, limit, skip, search } = pagination;
    const where = { status: "paid" };
    if (search) {
        where.OR = [
            { donorName: { contains: search, mode: "insensitive" } },
            { donorEmail: { contains: search, mode: "insensitive" } },
            { transactionId: { contains: search, mode: "insensitive" } },
            { campaign: { title: { contains: search, mode: "insensitive" } } },
        ];
    }
    const [data, total] = await prisma_1.default.$transaction([
        prisma_1.default.donation.findMany({
            where,
            include: { donor: true, payment: true, campaign: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma_1.default.donation.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
};
// ✅ Get single donation
const getSingleDonation = async (id) => {
    return await prisma_1.default.donation.findUnique({
        where: { id },
        include: {
            campaign: true,
            donor: true,
            payment: true,
        },
    });
};
const getMyDonations = async (userId, pagination) => {
    const { page, limit, skip, search } = pagination;
    const where = { donorId: userId, status: "paid" };
    if (search) {
        where.OR = [
            { transactionId: { contains: search, mode: "insensitive" } },
            { campaign: { title: { contains: search, mode: "insensitive" } } },
        ];
    }
    const [data, total] = await prisma_1.default.$transaction([
        prisma_1.default.donation.findMany({
            where,
            include: {
                campaign: { select: { id: true, title: true } },
                payment: { select: { id: true, amount: true, status: true } },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma_1.default.donation.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
};
exports.DonationService = {
    createDonation,
    getAllDonations,
    getSingleDonation,
    getMyDonations,
};
