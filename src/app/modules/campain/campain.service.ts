import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";


const createCampaign = async (
  id: string,
  file: Express.Multer.File | undefined,
  payload: any
) => {
  if (!file) {
    throw new AppError(httpStatus.BAD_REQUEST, "Image is required");
  }

  // upload image
  const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");

  const uploadResult: any = await sendImageToCloudinary(
    file.path,
    imageName
  );

  // tags safety
  const tags =
    typeof payload.tags === "string"
      ? JSON.parse(payload.tags)
      : payload.tags || [];

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
      featured: payload.featured === "true" || payload.featured === true,
      tags,
      creatorId: id,
      acceptedItems: payload.acceptedItems
    },
  });
};

const getAllCampaigns = async () => {
  const result = await prisma.campaign.findMany(
    {
      include: {
        donations: true,
        itemDonations: true
      }
    }
  )
  return result
};


const getCampaignById = async (id: string) => {
  const result = await prisma.campaign.findUnique({
    where: { id },
    include: {
      donations: {
        include:{
          donor:{
            select:{
              avatar:true,
              name:true,
            }
          }
        }
      },
      itemDonations: {
        where: {
          status: "assigned", 
        },
        include: {
          donor: {
            select: {
              avatar: true,
              name: true,
            },
          },
        },
      },
    },
  });

  return result;
};

const updateCampaign = async (
  id: string,
  file: Express.Multer.File | undefined,
  payload: any
) => {
  // Fetch existing campaign to get current image if needed
  const existing = await prisma.campaign.findUnique({ where: { id } });
  if (!existing) throw new AppError(httpStatus.NOT_FOUND, "Campaign not found");

  let imageUrl = existing.image;

  // Upload new image if provided
  if (file) {
    const imageName = Date.now() + "-" + file.originalname.replace(/\s/g, "-");
    const uploadResult: any = await sendImageToCloudinary(file.path, imageName);
    imageUrl = uploadResult.secure_url;
  }

  // Parse fields that might be JSON strings
  const tags =
    typeof payload.tags === "string"
      ? JSON.parse(payload.tags)
      : payload.tags ?? existing.tags;

  const acceptedItems =
    typeof payload.acceptedItems === "string"
      ? JSON.parse(payload.acceptedItems)
      : payload.acceptedItems ?? existing.acceptedItems;

  return await prisma.campaign.update({
    where: { id },
    data: {
      title: payload.title,
      slug: payload.slug,
      description: payload.description,
      story: payload.story,
      category: payload.category,
      goalAmount: payload.goalAmount ? Number(payload.goalAmount) : undefined,
      endDate: payload.endDate ? new Date(payload.endDate) : undefined,
      featured:
        payload.featured === "true" || payload.featured === true,
      tags,
      acceptedItems,
      // Only update image if a new file was uploaded
      ...(file && { image: imageUrl }),
    },
  });
};
const deleteCampaign = async (id: string) => {
  return await prisma.campaign.delete({
    where: { id },
  });
};

export const CampaignService = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};