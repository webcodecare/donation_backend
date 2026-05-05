import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { buildMeta, parsePagination } from "../../utils/paginate";
import { DonationService } from "./donation.service";

// Create donation + Stripe
const createDonation = catchAsync(async (req, res) => {
  const result = await DonationService.createDonation(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Donation created successfully",
    data: result,
  });
});

// Get all donations (admin) — paginated
const getAllDonations = catchAsync(async (req, res) => {
  const pagination = parsePagination(req.query);
  const { data, meta } = await DonationService.getAllDonations(pagination);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "All donations fetched",
    meta: buildMeta(meta.page, meta.limit, meta.total),
    data,
  });
});

// Get single donation
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

// My donations — paginated
const getMyDonations = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const pagination = parsePagination(req.query);
  const { data, meta } = await DonationService.getMyDonations(userId, pagination);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "all donation showing successfully",
    meta: buildMeta(meta.page, meta.limit, meta.total),
    data,
  });
});

export const DonationController = {
  createDonation,
  getAllDonations,
  getSingleDonation,
  getMyDonations,
};
