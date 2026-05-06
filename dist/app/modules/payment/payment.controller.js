"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_1 = __importDefault(require("http-status"));
const catchAsync_1 = __importDefault(require("../../utils/catchAsync"));
const sendResponse_1 = __importDefault(require("../../utils/sendResponse"));
const payment_service_1 = require("./payment.service");
// ✅ Create checkout session
const createCheckoutSession = (0, catchAsync_1.default)(async (req, res) => {
    const result = await payment_service_1.paymentService.createCheckoutSession(req.body);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.CREATED,
        message: "Checkout session created",
        data: result,
    });
});
// ⚠️ Confirm payment (NOT production-critical, only fallback)
const confirmPayment = (0, catchAsync_1.default)(async (req, res) => {
    const { session_id } = req.query;
    if (!session_id || typeof session_id !== "string") {
        return (0, sendResponse_1.default)(res, {
            success: false,
            statusCode: http_status_1.default.BAD_REQUEST,
            message: "Missing session_id",
        });
    }
    const result = await payment_service_1.paymentService.confirmPayment(session_id);
    (0, sendResponse_1.default)(res, {
        success: true,
        statusCode: http_status_1.default.OK,
        message: "Payment confirmed",
        data: result,
    });
});
exports.default = {
    createCheckoutSession,
    confirmPayment,
};
