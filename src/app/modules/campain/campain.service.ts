import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import { isLang, type Lang } from "../../config/i18n";

type CampaignTranslationInput = {
  lang: Lang;
  title?: string;
  description?: string;
  story?: string;
  successStory?: string;
};

const parseTranslations = (raw: unknown): CampaignTranslationInput[] => {
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
    .filter((t: any) => t && typeof t.lang === "string" && isLang(t.lang))
    .map((t: any) => ({
      lang: t.lang as Lang,
      title: typeof t.title === "string" ? t.title : undefined,
      description: typeof t.description === "string" ? t.description : undefined,
      story: typeof t.story === "string" ? t.story : undefined,
      successStory: typeof t.successStory === "string" ? t.successStory : undefined,
    }));
};

const uploadFiles = async (files: Express.Multer.File[]): Promise<string[]> => {
  const urls: string[] = [];
  for (const file of files) {
    const name = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
    const result: any = await sendImageToCloudinary(file.path, name);
    urls.push(result.secure_url);
  }
  return urls;
};

const createCampaign = async (
  id: string,
  file: Express.Multer.File | undefined,
  iconFiles: Express.Multer.File[],
  payload: any
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image is required");
  }

  const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
  const uploadResult: any = await sendImageToCloudinary(file.path, imageName);

  const icons = await uploadFiles(iconFiles);

  const tags =
    typeof payload.tags === "string" ? JSON.parse(payload.tags) : payload.tags || [];

  // Only persist translations that include all three required text fields
  const translations = parseTranslations(payload.translations).filter(
    (t) =>
      typeof t.title === "string" &&
      typeof t.description === "string" &&
      typeof t.story === "string"
  );

  return await prisma.campaign.create({
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
            title: t.title!,
            description: t.description!,
            story: t.story!,
            ...(t.successStory !== undefined && { successStory: t.successStory }),
          })),
        },
      }),
    },
    include: { translations: true },
  });
};

const getAllCampaigns = async (
  pagination: { page: number; limit: number; skip: number; search: string }
) => {
  const { page, limit, skip, search } = pagination;
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
          { story: { contains: search, mode: "insensitive" as const } },
          { slug: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [data, total] = await prisma.$transaction([
    prisma.campaign.findMany({
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
    prisma.campaign.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getCampaignById = async (id: string) => {
  return prisma.campaign.findUnique({
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

const updateCampaign = async (
  id: string,
  file: Express.Multer.File | undefined,
  iconFiles: Express.Multer.File[],
  payload: any
) => {
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, "Campaign not found");

  let imageUrl = existing.image;

  if (file) {
    const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
    const uploadResult: any = await sendImageToCloudinary(file.path, imageName);
    imageUrl = uploadResult.secure_url;
  }

  const newIconUrls = await uploadFiles(iconFiles);

  // Allow keeping previously-uploaded icon URLs via payload.existingIcons
  let keepIcons: string[] = existing.icons;
  if (payload.existingIcons !== undefined) {
    try {
      const parsed =
        typeof payload.existingIcons === "string"
          ? JSON.parse(payload.existingIcons)
          : payload.existingIcons;
      keepIcons = Array.isArray(parsed)
        ? parsed.filter((s: unknown) => typeof s === "string")
        : [];
    } catch {
      keepIcons = [];
    }
  }
  const icons = [...keepIcons, ...newIconUrls];

  const tags =
    typeof payload.tags === "string"
      ? JSON.parse(payload.tags)
      : payload.tags ?? existing.tags;

  const acceptedItems =
    typeof payload.acceptedItems === "string"
      ? JSON.parse(payload.acceptedItems)
      : payload.acceptedItems ?? existing.acceptedItems;

  const translations = parseTranslations(payload.translations);

  return prisma.$transaction(async (tx) => {
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
      const hasAllRequired =
        typeof t.title === "string" &&
        typeof t.description === "string" &&
        typeof t.story === "string";

      const existingT = await tx.campaignTranslation.findUnique({
        where: { campaignId_lang: { campaignId: id, lang: t.lang } },
      });

      if (!existingT && !hasAllRequired) continue;

      await tx.campaignTranslation.upsert({
        where: { campaignId_lang: { campaignId: id, lang: t.lang } },
        create: {
          campaignId: id,
          lang: t.lang,
          title: t.title!,
          description: t.description!,
          story: t.story!,
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

const deleteCampaign = async (id: string) => {
  return await prisma.campaign.delete({ where: { id } });
};

const completeCampaign = async (
  id: string,
  files: Express.Multer.File[] | undefined,
  payload: any
) => {
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, "Campaign not found");

  const successStory: string =
    typeof payload.successStory === "string" ? payload.successStory.trim() : "";
  if (!successStory) {
    throw new AppError(httpStatus.BAD_REQUEST, "Success story is required");
  }

  // Upload any new success images
  const uploadedImages: string[] = [];
  if (files?.length) {
    for (const file of files) {
      const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
      const result: any = await sendImageToCloudinary(file.path, imageName);
      uploadedImages.push(result.secure_url);
    }
  }

  // Allow keeping previously-uploaded URLs via payload.existingImages (JSON array of URLs)
  let keepExisting: string[] = [];
  if (payload.existingImages) {
    try {
      keepExisting =
        typeof payload.existingImages === "string"
          ? JSON.parse(payload.existingImages)
          : Array.isArray(payload.existingImages)
          ? payload.existingImages
          : [];
    } catch {
      keepExisting = [];
    }
  }
  const successImages = [...keepExisting.filter((s) => typeof s === "string"), ...uploadedImages];

  const translations = parseTranslations(payload.translations);

  return prisma.$transaction(async (tx) => {
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

export const CampaignService = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  completeCampaign,
};
