"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharityService = void 0;
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
        .filter((t) => t &&
        typeof t.lang === "string" &&
        (0, i18n_1.isLang)(t.lang) &&
        typeof t.name === "string" &&
        typeof t.description === "string")
        .map((t) => ({
        lang: t.lang,
        name: t.name,
        mission: t.mission ?? null,
        description: t.description,
        address: t.address ?? null,
    }));
};
// CREATE
const createCharity = async (_userId, files, payload) => {
    const logoFile = files?.logo?.[0];
    const bannerFile = files?.banner?.[0];
    if (!logoFile) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Logo is required");
    }
    if (!bannerFile) {
        throw new AppError_1.default(http_status_1.default.BAD_REQUEST, "Banner is required");
    }
    const logoName = Date.now() + "-" + logoFile.originalname.replace(/\s/g, "-");
    const bannerName = Date.now() + "-" + bannerFile.originalname.replace(/\s/g, "-");
    const logoUpload = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(logoFile.path, logoName);
    const bannerUpload = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(bannerFile.path, bannerName);
    const translations = parseTranslations(payload.translations);
    return prisma_1.default.charity.create({
        data: {
            name: payload.name,
            description: payload.description,
            mission: payload.mission,
            website: payload.website,
            email: payload.email,
            phone: payload.phone,
            address: payload.address,
            logo: logoUpload.secure_url,
            banner: bannerUpload.secure_url,
            verified: false,
            active: true,
            ...(translations.length > 0 && {
                translations: { create: translations },
            }),
        },
        include: { translations: true },
    });
};
// GET ALL
const getAllCharity = async (pagination) => {
    const { page, limit, skip, search } = pagination;
    const where = search
        ? {
            OR: [
                { name: { contains: search, mode: "insensitive" } },
                { description: { contains: search, mode: "insensitive" } },
                { mission: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
                { address: { contains: search, mode: "insensitive" } },
            ],
        }
        : {};
    const [data, total] = await prisma_1.default.$transaction([
        prisma_1.default.charity.findMany({
            where,
            orderBy: { createdAt: "desc" },
            include: { translations: true },
            skip,
            take: limit,
        }),
        prisma_1.default.charity.count({ where }),
    ]);
    return { data, meta: { page, limit, total } };
};
// GET SINGLE
const getSingleCharity = async (id) => {
    return prisma_1.default.charity.findUnique({
        where: { id },
        include: { translations: true },
    });
};
// UPDATE
const updateCharity = async (id, files, payload) => {
    const logoFile = files?.logo?.[0];
    const bannerFile = files?.banner?.[0];
    let logoUrl;
    let bannerUrl;
    if (logoFile) {
        const logoName = Date.now() + "-" + logoFile.originalname.replace(/\s/g, "-");
        const upload = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(logoFile.path, logoName);
        logoUrl = upload.secure_url;
    }
    if (bannerFile) {
        const bannerName = Date.now() + "-" + bannerFile.originalname.replace(/\s/g, "-");
        const upload = await (0, sendImageToCloudinary_1.sendImageToCloudinary)(bannerFile.path, bannerName);
        bannerUrl = upload.secure_url;
    }
    const translations = parseTranslations(payload.translations);
    return prisma_1.default.$transaction(async (tx) => {
        await tx.charity.update({
            where: { id },
            data: {
                name: payload.name,
                description: payload.description,
                mission: payload.mission,
                website: payload.website,
                email: payload.email,
                phone: payload.phone,
                address: payload.address,
                ...(logoUrl && { logo: logoUrl }),
                ...(bannerUrl && { banner: bannerUrl }),
            },
        });
        for (const t of translations) {
            await tx.charityTranslation.upsert({
                where: { charityId_lang: { charityId: id, lang: t.lang } },
                create: { charityId: id, ...t },
                update: {
                    name: t.name,
                    mission: t.mission,
                    description: t.description,
                    address: t.address,
                },
            });
        }
        return tx.charity.findUnique({ where: { id }, include: { translations: true } });
    });
};
// DELETE
const deleteCharity = async (id) => {
    return prisma_1.default.charity.delete({ where: { id } });
};
exports.CharityService = {
    createCharity,
    getAllCharity,
    getSingleCharity,
    updateCharity,
    deleteCharity,
};
