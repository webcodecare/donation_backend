import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import prisma from "../../utils/prisma";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { isLang, type Lang } from "../../config/i18n";

type CharityTranslationInput = {
  lang: Lang;
  name: string;
  mission?: string | null;
  description: string;
  address?: string | null;
};

const parseTranslations = (raw: unknown): CharityTranslationInput[] => {
  if (!raw) return [];
  let arr: any = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      return [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .filter(
      (t: any) =>
        t &&
        typeof t.lang === "string" &&
        isLang(t.lang) &&
        typeof t.name === "string" &&
        typeof t.description === "string"
    )
    .map((t: any) => ({
      lang: t.lang as Lang,
      name: t.name,
      mission: t.mission ?? null,
      description: t.description,
      address: t.address ?? null,
    }));
};

// CREATE
const createCharity = async (
  _userId: string,
  files: any,
  payload: any
) => {
  const logoFile = files?.logo?.[0];
  const bannerFile = files?.banner?.[0];

  if (!logoFile) {
    throw new AppError(httpStatus.BAD_REQUEST, "Logo is required");
  }

  if (!bannerFile) {
    throw new AppError(httpStatus.BAD_REQUEST, "Banner is required");
  }

  const logoName = Date.now() + "-" + logoFile.originalname.replace(/\s/g, "-");
  const bannerName = Date.now() + "-" + bannerFile.originalname.replace(/\s/g, "-");

  const logoUpload: any = await sendImageToCloudinary(logoFile.path, logoName);
  const bannerUpload: any = await sendImageToCloudinary(bannerFile.path, bannerName);

  const translations = parseTranslations(payload.translations);

  return prisma.charity.create({
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
const getAllCharity = async (
  pagination: { page: number; limit: number; skip: number; search: string }
) => {
  const { page, limit, skip, search } = pagination;
  const where = search
    ? {
        OR: [
          { name: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { mission: { contains: search, mode: "insensitive" as const } },
          { email: { contains: search, mode: "insensitive" as const } },
          { address: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.charity.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { translations: true },
      skip,
      take: limit,
    }),
    prisma.charity.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

// GET SINGLE
const getSingleCharity = async (id: string) => {
  return prisma.charity.findUnique({
    where: { id },
    include: { translations: true },
  });
};

// UPDATE
const updateCharity = async (id: string, files: any, payload: any) => {
  const logoFile = files?.logo?.[0];
  const bannerFile = files?.banner?.[0];

  let logoUrl;
  let bannerUrl;

  if (logoFile) {
    const logoName = Date.now() + "-" + logoFile.originalname.replace(/\s/g, "-");
    const upload: any = await sendImageToCloudinary(logoFile.path, logoName);
    logoUrl = upload.secure_url;
  }

  if (bannerFile) {
    const bannerName = Date.now() + "-" + bannerFile.originalname.replace(/\s/g, "-");
    const upload: any = await sendImageToCloudinary(bannerFile.path, bannerName);
    bannerUrl = upload.secure_url;
  }

  const translations = parseTranslations(payload.translations);

  return prisma.$transaction(async (tx) => {
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
const deleteCharity = async (id: string) => {
  return prisma.charity.delete({ where: { id } });
};

export const CharityService = {
  createCharity,
  getAllCharity,
  getSingleCharity,
  updateCharity,
  deleteCharity,
};
