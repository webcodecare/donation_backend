import { ItemDonation, PickupStatus } from "@prisma/client"
import { sendImageToCloudinary } from "../../utils/sendImageToCloudinary";
import prisma from "../../utils/prisma";
import AppError from "../../errors/AppError";
import httpStatus from "http-status";



const createItemDonation = async (
  donorId: string,
  files: Express.Multer.File[],
  payload: ItemDonation
) => {
  // Block item donations to completed (or closed) campaigns
  const campaign = await prisma.campaign.findUnique({
    where: { id: payload.campaignId },
    select: { id: true, status: true },
  });
  if (!campaign) {
    throw new AppError(httpStatus.NOT_FOUND, "Campaign not found");
  }
  if (campaign.status === "completed") {
    throw new AppError(
      httpStatus.BAD_REQUEST,
      "This campaign has been successfully completed and is no longer accepting item donations."
    );
  }
  if (campaign.status === "closed") {
    throw new AppError(httpStatus.BAD_REQUEST, "This campaign is closed.");
  }

  const uploadedImages: string[] = [];

  // upload images
  for (const file of files) {
    const imageName =
      Date.now() + "-" + file.originalname.replace(/\s/g, "-");

    const uploadResult: any = await sendImageToCloudinary(
      file.path,
      imageName
    );

    uploadedImages.push(uploadResult.secure_url);
  }

  const result = await prisma.itemDonation.create({
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
export const ItemDonationService = {
    createItemDonation,
};
const getAllItemDonations = async (
  pagination: { page: number; limit: number; skip: number; search: string }
) => {
  const { page, limit, skip, search } = pagination;
  const where: any = {};
  if (search) {
    where.OR = [
      { contactName: { contains: search, mode: "insensitive" as const } },
      { contactPhone: { contains: search, mode: "insensitive" as const } },
      { description: { contains: search, mode: "insensitive" as const } },
      { itemName: { contains: search, mode: "insensitive" as const } },
      { campaign: { title: { contains: search, mode: "insensitive" as const } } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.itemDonation.findMany({
      where,
      include: { campaign: true, donor: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.itemDonation.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};

const getMyDonations = async (
  userId: string,
  pagination: { page: number; limit: number; skip: number; search: string }
) => {
  const { page, limit, skip, search } = pagination;
  const where: any = { donorId: userId };
  if (search) {
    where.OR = [
      { itemName: { contains: search, mode: "insensitive" as const } },
      { description: { contains: search, mode: "insensitive" as const } },
      { campaign: { title: { contains: search, mode: "insensitive" as const } } },
    ];
  }

  const [data, total] = await prisma.$transaction([
    prisma.itemDonation.findMany({
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
    prisma.itemDonation.count({ where }),
  ]);

  return { data, meta: { page, limit, total } };
};


const deleteMyDonations = async (id:string,userId:string)=>{
  const isExistDonation = await prisma.itemDonation.findUnique(
    {
      where:{
        id:id 
      }
    }
  )

  if(!isExistDonation){
    throw new AppError(httpStatus.OK,"invalid donation id")
  }

  const result = await prisma.itemDonation.delete(
    {
      where:{
        id:id ,
        donorId:userId 
      }
    }
  )
  return result
}

const assignItemDonatoin = async (
  userId: string,
  itemDonationId: string,
  status: PickupStatus
) => {
  const isRealAdmin = await prisma.user.findUnique({
    where: {
      id: userId,
      role: "ADMIN",
    },
  });

  if (!isRealAdmin) {
    throw new AppError(httpStatus.NOT_FOUND, "Admin not found");
  }

  // 1. First update item donation
  const updatedDonation = await prisma.itemDonation.update({
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
  await prisma.campaign.update({
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


export const ItemDonationSerivce = {
    createItemDonation,
    getAllItemDonations,
    getMyDonations,
    deleteMyDonations,
    assignItemDonatoin
}