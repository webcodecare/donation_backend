"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemDonationController = void 0;
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const paginate_1 = require("../../utils/paginate");
const itemDonation_service_1 = require("./itemDonation.service");
const createItemDonation = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req?.user?.id;
    const files = req?.files;
    const result = await itemDonation_service_1.ItemDonationSerivce.createItemDonation(userId, files, req?.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "succesfully donate items",
        data: result,
    });
});
const getAllItemDonations = (0, catchAsync_1.default)(async (req, res) => {
    const pagination = (0, paginate_1.parsePagination)(req.query);
    const { data, meta } = await itemDonation_service_1.ItemDonationSerivce.getAllItemDonations(pagination);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "all Donation showing successfully",
        meta: (0, paginate_1.buildMeta)(meta.page, meta.limit, meta.total),
        data,
    });
});
const getMyDonations = (0, catchAsync_1.default)(async (req, res) => {
    const userId = req?.user?.id;
    const pagination = (0, paginate_1.parsePagination)(req.query);
    const { data, meta } = await itemDonation_service_1.ItemDonationSerivce.getMyDonations(userId, pagination);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "get my all donation showing successfully",
        meta: (0, paginate_1.buildMeta)(meta.page, meta.limit, meta.total),
        data,
    });
});
const deleteMyDonations = (0, catchAsync_1.default)(async (req, res) => {
    const id = req?.params.id;
    const userId = req?.user?.id;
    const result = await itemDonation_service_1.ItemDonationSerivce.deleteMyDonations(id, userId);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "remove donationItem successfully",
        data: result,
    });
});
const assignItemDonatoin = (0, catchAsync_1.default)(async (req, res) => {
    const itemDonationId = req?.params.id;
    const userId = req?.user?.id;
    const result = await itemDonation_service_1.ItemDonationSerivce.assignItemDonatoin(userId, itemDonationId, req.body.status);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "successfully assign item donatoins",
        data: result,
    });
});
exports.ItemDonationController = {
    createItemDonation,
    getAllItemDonations,
    getMyDonations,
    deleteMyDonations,
    assignItemDonatoin,
};
