"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const auth_services_1 = __importDefault(require("./auth.services"));
const Login = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_services_1.default.Login(req.body);
    const { access_token, refresh_token } = result;
    res.cookie('REFRESH_TOKEN', refresh_token, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // ✅ 7 days
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Login successful',
        data: {
            access_token,
        },
    });
});
const Register = (0, catchAsync_1.default)(async (req, res) => {
    const result = await auth_services_1.default.Register(req.body);
    const { access_token, refresh_token } = result;
    res.cookie('REFRESH_TOKEN', refresh_token, {
        expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: 'User registered successfully',
        data: {
            access_token,
        },
    });
});
const ChangePassword = (0, catchAsync_1.default)(async (req, res) => {
    await auth_services_1.default.ChangePassword(req.body, req.user);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: 'Password changed successfully',
    });
});
const AuthController = {
    Login,
    Register,
    ChangePassword,
};
exports.default = AuthController;
