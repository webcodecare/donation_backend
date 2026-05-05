import httpStatus from "http-status";
import AppError from "../../errors/AppError";
import prisma from "../../utils/prisma";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { isLang, type Lang } from "../../config/i18n";

type BannerTranslationInput = {
  lang: string;
  short_title?: string | null;
  title: string;
  description?: string | null;
};

const parseTranslations = (raw: unknown): BannerTranslationInput[] => {
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
    .filter((t: any) => t && typeof t.lang === "string" && typeof t.title === "string" && isLang(t.lang))
    .map((t: any) => ({
      lang: t.lang as Lang,
      short_title: t.short_title ?? null,
      title: t.title,
      description: t.description ?? null,
    }));
};

const createBanner = async (data: any, file: any) => {
  if (!file) {
    throw new AppError(httpStatus.NOT_FOUND, "photo is required ");
  }
  const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
  const uploadResult: any = await sendImageToCloudinary(file.path, imageName);

  const translations = parseTranslations(data.translations);

  return prisma.banner.create({
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

const getBanners = async (
  pagination: { page: number; limit: number; skip: number; search: string }
) => {
  const { page, limit, skip, search } = pagination;
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { short_title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.banner.findMany({
      where,
      orderBy: { order: "asc" },
      include: { translations: true },
      skip,
      take: limit,
    }),
    prisma.banner.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getSingleBanner = async (id: string) => {
  return prisma.banner.findUnique({
    where: { id },
    include: { translations: true },
  });
};

const updateBanner = async (id: string, data: any, file: any) => {
  const existingBanner = await prisma.banner.findUnique({ where: { id } });

  if (!existingBanner) {
    throw new AppError(httpStatus.NOT_FOUND, "Banner not found");
  }

  let photo = existingBanner.photo;

  if (file) {
    const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
    const uploadResult: any = await sendImageToCloudinary(file.path, imageName);
    photo = uploadResult.secure_url;
  }

  const translations = parseTranslations(data.translations);

  return prisma.$transaction(async (tx) => {
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

const deleteBanner = async (id: string) => {
  return prisma.banner.delete({ where: { id } });
};

export const BannerService = {
  createBanner,
  getBanners,
  getSingleBanner,
  updateBanner,
  deleteBanner,
};
