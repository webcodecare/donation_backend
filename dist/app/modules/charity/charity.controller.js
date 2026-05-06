"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharityController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const pickTranslation_1 = require("../../utils/pickTranslation");
const paginate_1 = require("../../utils/paginate");
const charity_service_1 = require("./charity.service");
// CREATE
const createCharity = (0, catchAsync_1.default)(async (req, res) => {
    const files = req.files;
    const result = await charity_service_1.CharityService.createCharity(req.user?.id, files, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Charity created successfully",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
// GET ALL
const getAllCharity = (0, catchAsync_1.default)(async (req, res) => {
    const pagination = (0, paginate_1.parsePagination)(req.query);
    const { data, meta } = await charity_service_1.CharityService.getAllCharity(pagination);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Charities fetched successfully",
        meta: (0, paginate_1.buildMeta)(meta.page, meta.limit, meta.total),
        data: (0, pickTranslation_1.resolveTranslationList)(data, req.lang),
    });
});
// GET SINGLE
const getSingleCharity = (0, catchAsync_1.default)(async (req, res) => {
    const result = await charity_service_1.CharityService.getSingleCharity(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Charity fetched successfully",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
// UPDATE
const updateCharity = (0, catchAsync_1.default)(async (req, res) => {
    const files = req.files;
    const result = await charity_service_1.CharityService.updateCharity(req.params.id, files, req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Charity updated successfully",
        data: (0, pickTranslation_1.resolveTranslation)(result, req.lang),
    });
});
// DELETE
const deleteCharity = (0, catchAsync_1.default)(async (req, res) => {
    const result = await charity_service_1.CharityService.deleteCharity(req.params.id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Charity deleted successfully",
        data: result,
    });
});
exports.CharityController = {
    createCharity,
    getAllCharity,
    getSingleCharity,
    updateCharity,
    deleteCharity,
};
