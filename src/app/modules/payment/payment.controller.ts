import { Request, Response } from "express";
import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { paymentService } from "./payment.service";

// ✅ Create checkout session
const createCheckoutSession = catchAsync(async (req: Request, res: Response) => {
  const result = await paymentService.createCheckoutSession(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Checkout session created",
    data: result,
  });
});

// ⚠️ Confirm payment (NOT production-critical, only fallback)
const confirmPayment = catchAsync(async (req: Request, res: Response) => {
  const { session_id } = req.query;

  if (!session_id || typeof session_id !== "string") {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.BAD_REQUEST,
      message: "Missing session_id",
    });
  }

  const result = await paymentService.confirmPayment(session_id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Payment confirmed",
    data: result,
  });
});

export default {
  createCheckoutSession,
  confirmPayment,
};