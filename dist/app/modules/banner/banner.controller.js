"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bannerController = exports.deleteBanner = exports.updateBanner = exports.getSingleBanner = exports.getBanners = exports.createBanner = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const pickTranslation_1 = require("../../utils/pickTranslation");
const paginate_1 = require("../../utils/paginate");
const banner_service_1 = require("./banner.service");
// CREATE
exports.createBanner = (0, catchAsync_1.default)(async (req, res) => {
    const result = await banner_service_1.BannerService.createBanner(req.body, req.file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 201,
        message: "Banner created successfully",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
// GET ALL
exports.getBanners = (0, catchAsync_1.default)(async (req, res) => {
    const pagination = (0, paginate_1.parsePagination)(req.query);
    const { data, meta } = await banner_service_1.BannerService.getBanners(pagination);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Banners fetched successfully",
        meta: (0, paginate_1.buildMeta)(meta.page, meta.limit, meta.total),
        data: (0, pickTranslation_1.resolveTranslationList)(data, req.lang),
    });
});
// GET SINGLE
exports.getSingleBanner = (0, catchAsync_1.default)(async (req, res) => {
    const result = await banner_service_1.BannerService.getSingleBanner(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Banner fetched successfully",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
// UPDATE
exports.updateBanner = (0, catchAsync_1.default)(async (req, res) => {
    const result = await banner_service_1.BannerService.updateBanner(req.params.id, req.body, req.file);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Banner updated successfully",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
// DELETE
exports.deleteBanner = (0, catchAsync_1.default)(async (req, res) => {
    await banner_service_1.BannerService.deleteBanner(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: 200,
        message: "Banner deleted successfully",
    });
});
exports.bannerController = {
    createBanner: exports.createBanner,
    getBanners: exports.getBanners,
    getSingleBanner: exports.getSingleBanner,
    updateBanner: exports.updateBanner,
    deleteBanner: exports.deleteBanner,
};
