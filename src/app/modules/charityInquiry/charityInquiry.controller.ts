import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { buildMeta, parsePagination } from "../../utils/paginate";
import { CharityInquiryService } from "./charityInquiry.service";

const createInquiry = catchAsync(async (req, res) => {
  const result = await CharityInquiryService.createInquiry(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Inquiry submitted successfully",
    data: result,
  });
});

const getInquiries = catchAsync(async (req, res) => {
  const pagination = parsePagination(req.query);
  const charityId = typeof req.query.charityId === "string" ? req.query.charityId : undefined;
  const status = typeof req.query.status === "string" ? req.query.status : undefined;

  const { data, meta } = await CharityInquiryService.getInquiries(pagination, {
    charityId,
    status,
  });

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Inquiries fetched successfully",
    meta: buildMeta(meta.page, meta.limit, meta.total),
    data,
  });
});

const getInquiryById = catchAsync(async (req, res) => {
  const result = await CharityInquiryService.getInquiryById(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Inquiry fetched successfully",
    data: result,
  });
});

const updateInquiryStatus = catchAsync(async (req, res) => {
  const result = await CharityInquiryService.updateInquiryStatus(
    req.params.id,
    req.body?.status
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Inquiry status updated",
    data: result,
  });
});

const deleteInquiry = catchAsync(async (req, res) => {
  await CharityInquiryService.deleteInquiry(req.params.id);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Inquiry deleted",
  });
});

export const CharityInquiryController = {
  createInquiry,
  getInquiries,
  getInquiryById,
  updateInquiryStatus,
  deleteInquiry,
};
