"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharityInquiryController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const paginate_1 = require("../../utils/paginate");
const charityInquiry_service_1 = require("./charityInquiry.service");
const createInquiry = (0, catchAsync_1.default)(async (req, res) => {
    const result = await charityInquiry_service_1.CharityInquiryService.createInquiry(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Inquiry submitted successfully",
        data: result,
    });
});
const getInquiries = (0, catchAsync_1.default)(async (req, res) => {
    const pagination = (0, paginate_1.parsePagination)(req.query);
    const charityId = typeof req.query.charityId === "string" ? req.query.charityId : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const { data, meta } = await charityInquiry_service_1.CharityInquiryService.getInquiries(pagination, {
        charityId,
        status,
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Inquiries fetched successfully",
        meta: (0, paginate_1.buildMeta)(meta.page, meta.limit, meta.total),
        data,
    });
});
const getInquiryById = (0, catchAsync_1.default)(async (req, res) => {
    const result = await charityInquiry_service_1.CharityInquiryService.getInquiryById(String(req.params.id));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Inquiry fetched successfully",
        data: result,
    });
});
const updateInquiryStatus = (0, catchAsync_1.default)(async (req, res) => {
    const result = await charityInquiry_service_1.CharityInquiryService.updateInquiryStatus(String(req.params.id), req.body?.status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Inquiry status updated",
        data: result,
    });
});
const deleteInquiry = (0, catchAsync_1.default)(async (req, res) => {
    await charityInquiry_service_1.CharityInquiryService.deleteInquiry(String(req.params.id));
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Inquiry deleted",
    });
});
exports.CharityInquiryController = {
    createInquiry,
    getInquiries,
    getInquiryById,
    updateInquiryStatus,
    deleteInquiry,
};
