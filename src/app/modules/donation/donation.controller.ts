import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { DonationService } from "./donation.service";

// ✅ Create donation + Stripe
const createDonation = catchAsync(async (req, res) => {
  const result = await DonationService.createDonation(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Donation created successfully",
    data: result,
  });
});

// ✅ Get all donations (admin)
const getAllDonations = catchAsync(async (req, res) => {
  const result = await DonationService.getAllDonations();

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All donations fetched",
    data: result,
  });
});

// ✅ Get single donation
const getSingleDonation = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await DonationService.getSingleDonation(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Donation fetched",
    data: result,
  });
});

// ✅ My donations
const getMyDonations = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const result = await DonationService.getMyDonations(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "all donation showing successfully",
    data: result,
  });
});

export const DonationController = {
  createDonation,
  getAllDonations,
  getSingleDonation,
  getMyDonations,
};