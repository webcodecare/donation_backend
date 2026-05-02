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
const getAllItemDonations = async() => { 
    const result = await prisma.itemDonation.findMany(
        {
            include:{
                campaign:true,
                donor:true
            }
        }
    )
    return result
}
const getMyDonations = async (id: string) => {
  const result = await prisma.itemDonation.findMany({
    where: {
      donorId: id,
    },
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
    orderBy: {
      createdAt: 'desc',
    },
  });

  return result;
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