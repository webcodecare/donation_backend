"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const pickTranslation_1 = require("../../utils/pickTranslation");
const paginate_1 = require("../../utils/paginate");
const campain_service_1 = require("./campain.service");
const createCampaign = (0, catchAsync_1.default)(async (req, res) => {
    const files = req.files;
    const imageFile = files?.image?.[0];
    const iconFiles = files?.icons ?? [];
    const userid = req?.user?.id;
    const result = await campain_service_1.CampaignService.createCampaign(userid, imageFile, iconFiles, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Campaign created successfully",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
const getAllCampaigns = (0, catchAsync_1.default)(async (req, res) => {
    const pagination = (0, paginate_1.parsePagination)(req.query);
    const { data, meta } = await campain_service_1.CampaignService.getAllCampaigns(pagination);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Campaigns fetched successfully",
        meta: (0, paginate_1.buildMeta)(meta.page, meta.limit, meta.total),
        data: (0, pickTranslation_1.resolveTranslationList)(data, req.lang),
    });
});
const getCampaignById = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await campain_service_1.CampaignService.getCampaignById(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Campaign fetched successfully",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
const updateCampaign = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const files = req.files;
    const imageFile = files?.image?.[0];
    const iconFiles = files?.icons ?? [];
    const result = await campain_service_1.CampaignService.updateCampaign(id, imageFile, iconFiles, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Campaign updated successfully",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
const deleteCampaign = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await campain_service_1.CampaignService.deleteCampaign(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Campaign deleted successfully",
        data: result,
    });
});
const completeCampaign = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const files = req.files ?? undefined;
    const result = await campain_service_1.CampaignService.completeCampaign(id, files, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Campaign marked as completed",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
exports.CampaignController = {
    createCampaign,
    getAllCampaigns,
    getCampaignById,
    updateCampaign,
    deleteCampaign,
    completeCampaign,
};
