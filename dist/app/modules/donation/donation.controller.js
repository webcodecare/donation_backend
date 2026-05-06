"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DonationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const paginate_1 = require("../../utils/paginate");
const donation_service_1 = require("./donation.service");
// Create donation + Stripe
const createDonation = (0, catchAsync_1.default)(async (req, res) => {
    const result = await donation_service_1.DonationService.createDonation(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Donation created successfully",
        data: result,
    });
});
// Get all donations (admin) — paginated
const getAllDonations = (0, catchAsync_1.default)(async (req, res) => {
    const pagination = (0, paginate_1.parsePagination)(req.query);
    const { data, meta } = await donation_service_1.DonationService.getAllDonations(pagination);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "All donations fetched",
        meta: (0, paginate_1.buildMeta)(meta.page, meta.limit, meta.total),
        data,
    });
});
// Get single donation
const getSingleDonation = (0, catchAsync_1.default)(async (req, res) => {
    const { id } = req.params;
    const result = await donation_service_1.DonationService.getSingleDonation(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Donation fetched",
        data: result,
    });
});
// My donations — paginated
const getMyDonations = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req.user.id;
    const pagination = (0, paginate_1.parsePagination)(req.query);
    const { data, meta } = await donation_service_1.DonationService.getMyDonations(userId, pagination);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "all donation showing successfully",
        meta: (0, paginate_1.buildMeta)(meta.page, meta.limit, meta.total),
        data,
    });
});
exports.DonationController = {
    createDonation,
    getAllDonations,
    getSingleDonation,
    getMyDonations,
};
