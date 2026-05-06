"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserController = void 0;
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const user_service_1 = require("./user.service");
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const http_status_1 = __importDefault(require("http-status"));
const paginate_1 = require("../../utils/paginate");
const GetAllUsers = (0, catchAsync_1.default)(async (req, res) => {
    const pagination = (0, paginate_1.parsePagination)(req.query);
    const { data, meta } = await user_service_1.UserService.GetAllUsers(pagination);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Users retrieve successful',
        meta: (0, paginate_1.buildMeta)(meta.page, meta.limit, meta.total),
        data,
    });
});
const GetSingleUser = (0, catchAsync_1.default)(async (req, res) => {
    const id = String(req.params?.id);
    const result = await user_service_1.UserService.GetSingleUser(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'User retrieve successful',
        data: result,
    });
});
const DeleteUser = (0, catchAsync_1.default)(async (req, res) => {
    const id = String(req.params?.id);
    await user_service_1.UserService.DeleteUser(id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'User deleted',
    });
});
exports.UserController = {
    GetAllUsers,
    GetSingleUser,
    DeleteUser,
};
