"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemDonationSerivce = exports.ItemDonationService = void 0;
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const createItemDonation = async (donorId, files, payload) => {
    // Block item donations to completed (or closed) campaigns
    const campaign = await prisma_1.default.campaign.findUnique({
        where: { id: payload.campaignId },
        select: { id: true, status: true },
    });
    if (!campaign) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Campaign not found");
    }
    if (campaign.status === "completed") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This campaign has been successfully completed and is no longer accepting item donations.");
    }
    if (campaign.status === "closed") {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "This campaign is closed.");
    }
    const uploadedImages = [];
    // upload images
    for (const file of files) {
        const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
        const uploadResult = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, imageName);
        uploadedImages.push(uploadResult.secure_url);
    }
    const result = await prisma_1.default.itemDonation.create({
        data: {
            contactName: payload.contactName,
            contactPhone: payload.contactPhone,
            category: payload.category,
            quantity: Number(payload.quantity),
            condition: payload.condition,
            description: payload.description,
            pickupAddress: payload.pickupAddress,
            preferredDate: new Date(payload.preferredDate),
            preferredTime: payload.preferredTime,
            donor: {
                connect: {
                    id: donorId,
                },
            },
            campaign: {
                connect: {
                    id: payload.campaignId,
                },
            },
            photos: uploadedImages,
        },
    });
    return result;
};
exports.ItemDonationService = {
    createItemDonation,
};
const getAllItemDonations = async (pagination) => {
    const { page, limit, skip, search } = pagination;
    const where = {};
    if (search) {
        where.OR = [
            { contactName: { contains: search, mode: "insensitive" } },
            { contactPhone: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { itemName: { contains: search, mode: "insensitive" } },
            { campaign: { title: { contains: search, mode: "insensitive" } } },
        ];
    }
    const [data, total] = await prisma_1.default.$transaction([
        prisma_1.default.itemDonation.findMany({
            where,
            include: { campaign: true, donor: true },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma_1.default.itemDonation.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
};
const getMyDonations = async (userId, pagination) => {
    const { page, limit, skip, search } = pagination;
    const where = { donorId: userId };
    if (search) {
        where.OR = [
            { itemName: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { campaign: { title: { contains: search, mode: "insensitive" } } },
        ];
    }
    const [data, total] = await prisma_1.default.$transaction([
        prisma_1.default.itemDonation.findMany({
            where,
            include: {
                campaign: {
                    select: {
                        id: true,
                        title: true,
                        image: true,
                        category: true,
                        status: true,
                        slug: true,
                    },
                },
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma_1.default.itemDonation.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
};
const deleteMyDonations = async (id, userId) => {
    const isExistDonation = await prisma_1.default.itemDonation.findUnique({
        where: {
            id: id
        }
    });
    if (!isExistDonation) {
        throw new AppError_1.default(http_status_1.default.OK, "invalid donation id");
    }
    const result = await prisma_1.default.itemDonation.delete({
        where: {
            id: id,
            donorId: userId
        }
    });
    return result;
};
const assignItemDonatoin = async (userId, itemDonationId, status) => {
    const isRealAdmin = await prisma_1.default.user.findUnique({
        where: {
            id: userId,
            role: "ADMIN",
        },
    });
    if (!isRealAdmin) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Admin not found");
    }
    // 1. First update item donation
    const updatedDonation = await prisma_1.default.itemDonation.update({
        where: {
            id: itemDonationId,
        },
        data: {
            status: status,
        },
        include: {
            campaign: true,
        },
    });
    // 2. Increment contributor count
    await prisma_1.default.campaign.update({
        where: {
            id: updatedDonation.campaignId,
        },
        data: {
            contributor: {
                increment: 1,
            },
        },
    });
    return updatedDonation;
};
exports.ItemDonationSerivce = {
    createItemDonation,
    getAllItemDonations,
    getMyDonations,
    deleteMyDonations,
    assignItemDonatoin
};
