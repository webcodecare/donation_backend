import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { resolveTranslation, resolveTranslationList } from "../../utils/pickTranslation";
import { buildMeta, parsePagination } from "../../utils/paginate";
import { CampaignService } from "./campain.service";

const createCampaign = catchAsync(async (req, res) => {
  const files = req.files as
    | { image?: Express.Multer.File[]; icons?: Express.Multer.File[] }
    | undefined;
  const imageFile = files?.image?.[0];
  const iconFiles = files?.icons ?? [];
  const userid = req?.user?.id;
  const result = await CampaignService.createCampaign(
    userid,
    imageFile,
    iconFiles,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Campaign created successfully",
    data: resolveTranslation(result, req.lang),
  });
});

const getAllCampaigns = catchAsync(async (req, res) => {
  const pagination = parsePagination(req.query);
  const category =
    typeof req.query.category === "string" ? req.query.category : undefined;
  const sortBy =
    typeof req.query.sortBy === "string" ? req.query.sortBy : undefined;

  const { data, meta } = await CampaignService.getAllCampaigns(pagination, {
    category,
    sortBy,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Campaigns fetched successfully",
    meta: buildMeta(meta.page, meta.limit, meta.total),
    data: resolveTranslationList(data, req.lang),
  });
});

const getCampaignById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await CampaignService.getCampaignById(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Campaign fetched successfully",
    data: resolveTranslation(result, req.lang),
  });
});

const updateCampaign = catchAsync(async (req, res) => {
  const { id } = req.params;
  const files = req.files as
    | { image?: Express.Multer.File[]; icons?: Express.Multer.File[] }
    | undefined;
  const imageFile = files?.image?.[0];
  const iconFiles = files?.icons ?? [];

  const result = await CampaignService.updateCampaign(
    id as string,
    imageFile,
    iconFiles,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Campaign updated successfully",
    data: resolveTranslation(result, req.lang),
  });
});

const deleteCampaign = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await CampaignService.deleteCampaign(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Campaign deleted successfully",
    data: result,
  });
});

const completeCampaign = catchAsync(async (req, res) => {
  const { id } = req.params;
  const files = (req.files as Express.Multer.File[] | undefined) ?? undefined;

  const result = await CampaignService.completeCampaign(id as string, files, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Campaign marked as completed",
    data: resolveTranslation(result, req.lang),
  });
});

export const CampaignController = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
  completeCampaign,
};
