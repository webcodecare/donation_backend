import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import httpStatus from "http-status";
import { resolveTranslation, resolveTranslationList } from "../../utils/pickTranslation";
import { buildMeta, parsePagination } from "../../utils/paginate";
import { CharityService } from "./charity.service";

// CREATE
const createCharity = catchAsync(async (req, res) => {
  const files = req.files as {
    logo?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };

  const result = await CharityService.createCharity(req.user?.id, files, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Charity created successfully",
    data: resolveTranslation(result, req.lang),
  });
});

// GET ALL
const getAllCharity = catchAsync(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { data, meta } = await CharityService.getAllCharity(pagination);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Charities fetched successfully",
    meta: buildMeta(meta.page, meta.limit, meta.total),
    data: resolveTranslationList(data, req.lang),
  });
});

// GET SINGLE
const getSingleCharity = catchAsync(async (req, res) => {
  const result = await CharityService.getSingleCharity(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Charity fetched successfully",
    data: resolveTranslation(result, req.lang),
  });
});

// UPDATE
const updateCharity = catchAsync(async (req, res) => {
  const files = req.files as {
    logo?: Express.Multer.File[];
    banner?: Express.Multer.File[];
  };

  const result = await CharityService.updateCharity(req.params.id as string, files, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Charity updated successfully",
    data: resolveTranslation(result, req.lang),
  });
});

// DELETE
const deleteCharity = catchAsync(async (req, res) => {
  const result = await CharityService.deleteCharity(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Charity deleted successfully",
    data: result,
  });
});

export const CharityController = {
  createCharity,
  getAllCharity,
  getSingleCharity,
  updateCharity,
  deleteCharity,
};
