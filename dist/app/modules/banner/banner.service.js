"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerService = void 0;
const http_status_1 = __importDefault(require("http-status"));
const AppError_1 = __importDefault(require("../../errors/AppError"));
const prisma_1 = __importDefault(require("../../utils/prisma"));
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
        .filter((t) => t && typeof t.lang === "string" && typeof t.title === "string" && (0, i18n_1.isLang)(t.lang))
        .map((t) => ({
        lang: t.lang,
        short_title: t.short_title ?? null,
        title: t.title,
        description: t.description ?? null,
    }));
};
const createBanner = async (data, file) => {
    if (!file) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "photo is required ");
    }
    const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
    const uploadResult = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, imageName);
    const translations = parseTranslations(data.translations);
    return prisma_1.default.banner.create({
        data: {
            short_title: data.short_title,
            title: data.title,
            description: data.description,
            photo: uploadResult.secure_url,
            ...(translations.length > 0 && {
                translations: { create: translations },
            }),
        },
        include: { translations: true },
    });
};
const getBanners = async (pagination) => {
    const { page, limit, skip, search } = pagination;
    const where = search
        ? {
            OR: [
                { title: { contains: search, mode: "insensitive" } },
                { short_title: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
            ],
        }
        : {};
    const [data, total] = await prisma_1.default.$transaction([
        prisma_1.default.banner.findMany({
            where,
            orderBy: { order: "asc" },
            include: { translations: true },
            skip,
            take: limit,
        }),
        prisma_1.default.banner.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
};
const getSingleBanner = async (id) => {
    return prisma_1.default.banner.findUnique({
        where: { id },
        include: { translations: true },
    });
};
const updateBanner = async (id, data, file) => {
    const existingBanner = await prisma_1.default.banner.findUnique({ where: { id } });
    if (!existingBanner) {
        throw new AppError_1.default(http_status_1.default.NOT_FOUND, "Banner not found");
    }
    let photo = existingBanner.photo;
    if (file) {
        const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
        const uploadResult = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(file.path, imageName);
        photo = uploadResult.secure_url;
    }
    const translations = parseTranslations(data.translations);
    return prisma_1.default.$transaction(async (tx) => {
        const updated = await tx.banner.update({
            where: { id },
            data: {
                short_title: data.short_title,
                title: data.title,
                description: data.description,
                photo,
            },
        });
        for (const t of translations) {
            await tx.bannerTranslation.upsert({
                where: { bannerId_lang: { bannerId: id, lang: t.lang } },
                create: { bannerId: id, ...t },
                update: { short_title: t.short_title, title: t.title, description: t.description },
            });
        }
        return tx.banner.findUnique({ where: { id }, include: { translations: true } });
    });
};
const deleteBanner = async (id) => {
    return prisma_1.default.banner.delete({ where: { id } });
};
exports.BannerService = {
    createBanner,
    getBanners,
    getSingleBanner,
    updateBanner,
    deleteBanner,
};
