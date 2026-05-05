import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { resolveTranslation, resolveTranslationList } from "../../utils/pickTranslation";
import { buildMeta, parsePagination } from "../../utils/paginate";
import { BannerService } from "./banner.service";

// CREATE
export const createBanner = catchAsync(async (req, res) => {
  const result = await BannerService.createBanner(req.body, req.file);

  sendResponse(res, {
    success: true,
    statusCode: 201,
    message: "Banner created successfully",
    data: resolveTranslation(result, req.lang),
  });
});

// GET ALL
export const getBanners = catchAsync(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { data, meta } = await BannerService.getBanners(pagination);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Banners fetched successfully",
    meta: buildMeta(meta.page, meta.limit, meta.total),
    data: resolveTranslationList(data, req.lang),
  });
});

// GET SINGLE
export const getSingleBanner = catchAsync(async (req, res) => {
  const result = await BannerService.getSingleBanner(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Banner fetched successfully",
    data: resolveTranslation(result, req.lang),
  });
});

// UPDATE
export const updateBanner = catchAsync(async (req, res) => {
  const result = await BannerService.updateBanner(
    req.params.id as string,
    req.body,
    req.file
  );

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Banner updated successfully",
    data: resolveTranslation(result, req.lang),
  });
});

// DELETE
export const deleteBanner = catchAsync(async (req, res) => {
  await BannerService.deleteBanner(req.params.id as string);

  sendResponse(res, {
    success: true,
    statusCode: 200,
    message: "Banner deleted successfully",
  });
});

export const bannerController = {
  createBanner,
  getBanners,
  getSingleBanner,
  updateBanner,
  deleteBanner,
};
