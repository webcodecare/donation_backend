import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { buildMeta, parsePagination } from "../../utils/paginate";
import { ItemDonationSerivce } from "./itemDonation.service";


const createItemDonation = catchAsync(async (req, res) => {
  const userId = req?.user?.id;
  const files = req?.files as Express.Multer.File[];
  const result = await ItemDonationSerivce.createItemDonation(userId, files, req?.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "succesfully donate items",
    data: result,
  });
});


const getAllItemDonations = catchAsync(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { data, meta } = await ItemDonationSerivce.getAllItemDonations(pagination);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "all Donation showing successfully",
    meta: buildMeta(meta.page, meta.limit, meta.total),
    data,
  });
});


const getMyDonations = catchAsync(async (req, res) => {
  const userId = req?.user?.id;
  const pagination = parsePagination(req.query);
  const { data, meta } = await ItemDonationSerivce.getMyDonations(userId, pagination);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "get my all donation showing successfully",
    meta: buildMeta(meta.page, meta.limit, meta.total),
    data,
  });
});

const deleteMyDonations = catchAsync(async (req, res) => {
  const id = req?.params.id;
  const userId = req?.user?.id;

  const result = await ItemDonationSerivce.deleteMyDonations(id as string, userId);
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "remove donationItem successfully",
    data: result,
  });
});

const assignItemDonatoin = catchAsync(async (req, res) => {
  const itemDonationId = req?.params.id;
  const userId = req?.user?.id;
  const result = await ItemDonationSerivce.assignItemDonatoin(
    userId,
    itemDonationId as string,
    req.body.status
  );
  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "successfully assign item donatoins",
    data: result,
  });
});

export const ItemDonationController = {
  createItemDonation,
  getAllItemDonations,
  getMyDonations,
  deleteMyDonations,
  assignItemDonatoin,
};
