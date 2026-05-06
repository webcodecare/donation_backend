"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignService = void 0;
const prisma_1 = __importDefault(require("../../utils/prisma"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const http_status_1 = __importDefault(require("http-status"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const i18n_1 = require("../../config/i18n");
const parseTranslations = (raw) => {
    if (!raw)
        return [];
    let arr = raw;
    if (typeof raw === "string") {
        try {
            arr = JSON.parse(raw);
        }
        catch {
            return [];
        }
    }
    if (!Array.isArray(arr))
        return [];
    return arr
        .filter((t) => t && typeof t.lang === "string" && (0, i18n_1.isLang)(t.lang))
        .map((t) => ({
        lang: t.lang,
        title: typeof t.title === "string" ? t.title : undefined,
        description: typeof t.description === "string" ? t.description : undefined,
        story: typeof t.story === "string" ? t.story : undefined,
        successStory: typeof t.successStory === "string" ? t.successStory : undefined,
    }));
};
const uploadFiles = async (files) => {
    const urls = [];
    for (const file of files) {
        const name = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
        const result = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, name);
        urls.push(result.secure_url);
    }
    return urls;
};
const createCampaign = async (id, file, iconFiles, payload) => {
    if (!file) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Image is required");
    }
    const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
    const uploadResult = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, imageName);
    const icons = await uploadFiles(iconFiles);
    const tags = typeof payload.tags === "string" ? JSON.parse(payload.tags) : payload.tags || [];
    // Only persist translations that include all three required text fields
    const translations = parseTranslations(payload.translations).filter((t) => typeof t.title === "string" &&
        typeof t.description === "string" &&
        typeof t.story === "string");
    return await prisma_1.default.campaign.create({
        data: {
            title: payload.title,
            slug: payload.slug,
            description: payload.description,
            story: payload.story,
            category: payload.category,
            status: "pending",
            goalAmount: Number(payload.goalAmount),
            collectedAmount: 0,
            endDate: new Date(payload.endDate),
            image: uploadResult.secure_url,
            icons,
            featured: payload.featured === "true" || payload.featured === true,
            tags,
            creatorId: id,
            acceptedItems: payload.acceptedItems,
            ...(translations.length > 0 && {
                translations: {
                    create: translations.map((t) => ({
                        lang: t.lang,
                        title: t.title,
                        description: t.description,
                        story: t.story,
                        ...(t.successStory !== undefined && { successStory: t.successStory }),
                    })),
                },
            }),
        },
        include: { translations: true },
    });
};
const getAllCampaigns = async (pagination) => {
    const { page, limit, skip, search } = pagination;
    const where = search
        ? {
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { story: { contains: search, mode: "insensitive" } },
                { slug: { contains: search, mode: "insensitive" } },
            ],
        }
        : {};
    const [data, total] = await prisma_1.default.$transaction([
        prisma_1.default.campaign.findMany({
            where,
            include: {
                donations: true,
                itemDonations: true,
                translations: true,
            },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
        }),
        prisma_1.default.campaign.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
};
const getCampaignById = async (id) => {
    return prisma_1.default.campaign.findUnique({
        where: { id },
        include: {
            donations: {
                include: {
                    donor: { select: { avatar: true, name: true } },
                },
            },
            itemDonations: {
                where: { status: "assigned" },
                include: {
                    donor: { select: { avatar: true, name: true } },
                },
            },
            translations: true,
        },
    });
};
const updateCampaign = async (id, file, iconFiles, payload) => {
    const existing = await prisma_1.default.campaign.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Campaign not found");
    let imageUrl = existing.image;
    if (file) {
        const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
        const uploadResult = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, imageName);
        imageUrl = uploadResult.secure_url;
    }
    const newIconUrls = await uploadFiles(iconFiles);
    // Allow keeping previously-uploaded icon URLs via payload.existingIcons
    let keepIcons = existing.icons;
    if (payload.existingIcons !== undefined) {
        try {
            const parsed = typeof payload.existingIcons === "string"
                ? JSON.parse(payload.existingIcons)
                : payload.existingIcons;
            keepIcons = Array.isArray(parsed)
                ? parsed.filter((s) => typeof s === "string")
                : [];
        }
        catch {
            keepIcons = [];
        }
    }
    const icons = [...keepIcons, ...newIconUrls];
    const tags = typeof payload.tags === "string"
        ? JSON.parse(payload.tags)
        : payload.tags ?? existing.tags;
    const acceptedItems = typeof payload.acceptedItems === "string"
        ? JSON.parse(payload.acceptedItems)
        : payload.acceptedItems ?? existing.acceptedItems;
    const translations = parseTranslations(payload.translations);
    return prisma_1.default.$transaction(async (tx) => {
        await tx.campaign.update({
            where: { id },
            data: {
                title: payload.title,
                slug: payload.slug,
                description: payload.description,
                story: payload.story,
                category: payload.category,
                goalAmount: payload.goalAmount ? Number(payload.goalAmount) : undefined,
                endDate: payload.endDate ? new Date(payload.endDate) : undefined,
                featured: payload.featured === "true" || payload.featured === true,
                tags,
                acceptedItems,
                icons,
                ...(file && { image: imageUrl }),
            },
        });
        for (const t of translations) {
            const hasAllRequired = typeof t.title === "string" &&
                typeof t.description === "string" &&
                typeof t.story === "string";
            const existingT = await tx.campaignTranslation.findUnique({
                where: { campaignId_lang: { campaignId: id, lang: t.lang } },
            });
            if (!existingT && !hasAllRequired)
                continue;
            await tx.campaignTranslation.upsert({
                where: { campaignId_lang: { campaignId: id, lang: t.lang } },
                create: {
                    campaignId: id,
                    lang: t.lang,
                    title: t.title,
                    description: t.description,
                    story: t.story,
                    ...(t.successStory !== undefined && { successStory: t.successStory }),
                },
                update: {
                    ...(t.title !== undefined && { title: t.title }),
                    ...(t.description !== undefined && { description: t.description }),
                    ...(t.story !== undefined && { story: t.story }),
                    ...(t.successStory !== undefined && { successStory: t.successStory }),
                },
            });
        }
        return tx.campaign.findUnique({
            where: { id },
            include: { translations: true },
        });
    });
};
const deleteCampaign = async (id) => {
    return await prisma_1.default.campaign.delete({ where: { id } });
};
const completeCampaign = async (id, files, payload) => {
    const existing = await prisma_1.default.campaign.findUnique({ where: { id } });
    if (!existing)
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Campaign not found");
    const successStory = typeof payload.successStory === "string" ? payload.successStory.trim() : "";
    if (!successStory) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Success story is required");
    }
    // Upload any new success images
    const uploadedImages = [];
    if (files?.length) {
        for (const file of files) {
            const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
            const result = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, imageName);
            uploadedImages.push(result.secure_url);
        }
    }
    // Allow keeping previously-uploaded URLs via payload.existingImages (JSON array of URLs)
    let keepExisting = [];
    if (payload.existingImages) {
        try {
            keepExisting =
                typeof payload.existingImages === "string"
                    ? JSON.parse(payload.existingImages)
                    : Array.isArray(payload.existingImages)
                        ? payload.existingImages
                        : [];
        }
        catch {
            keepExisting = [];
        }
    }
    const successImages = [...keepExisting.filter((s) => typeof s === "string"), ...uploadedImages];
    const translations = parseTranslations(payload.translations);
    return prisma_1.default.$transaction(async (tx) => {
        const updated = await tx.campaign.update({
            where: { id },
            data: {
                status: "completed",
                successStory,
                successImages,
                completedAt: new Date(),
            },
        });
        // Upsert per-language success stories. Translations array may carry
        // {lang, successStory} only; keep title/description/story from existing rows.
        for (const t of translations) {
            const existingT = await tx.campaignTranslation.findUnique({
                where: { campaignId_lang: { campaignId: id, lang: t.lang } },
            });
            await tx.campaignTranslation.upsert({
                where: { campaignId_lang: { campaignId: id, lang: t.lang } },
                create: {
                    campaignId: id,
                    lang: t.lang,
                    title: t.title || existingT?.title || updated.title,
                    description: t.description || existingT?.description || updated.description,
                    story: t.story || existingT?.story || updated.story,
                    successStory: t.successStory || null,
                },
                update: {
                    ...(t.successStory !== undefined && { successStory: t.successStory || null }),
                },
            });
        }
        return tx.campaign.findUnique({
            where: { id },
            include: { translations: true },
        });
    });
};
exports.CampaignService = {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    completeCampaign,
};
