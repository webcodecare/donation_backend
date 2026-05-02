import httpStatus from "http-status";
import catchAsync from "../../utils/catchAsync";
import sendResponse from "../../utils/sendResponse";
import { CampaignService } from "./campain.service";



const createCampaign = catchAsync(async (req, res) => {
  const file = req.file;
  const userid = req?.user?.id
  const result = await CampaignService.createCampaign(
    userid,
    file,
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.CREATED,
    message: "Campaign created successfully",
    data: result,
  });
});


const getAllCampaigns = catchAsync(async (req, res) => {
  console.log("start")
  const result = await CampaignService.getAllCampaigns();
  console.log("end")

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Campaigns fetched successfully",
    data: result,
  });
});


const getCampaignById = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await CampaignService.getCampaignById(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Campaign fetched successfully",
    data: result,
  });
});


const updateCampaign = catchAsync(async (req, res) => {
  const { id } = req.params;
  const file = req.file;  

  const result = await CampaignService.updateCampaign(
    id as string,
    file,              
    req.body
  );

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Campaign updated successfully",
    data: result,
  });
});

const deleteCampaign = catchAsync(async (req, res) => {
  const { id } = req.params;

  const result = await CampaignService.deleteCampaign(id as string);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: "Campaign deleted successfully",
    data: result,
  });
});


export const CampaignController = {
  createCampaign,
  getAllCampaigns,
  getCampaignById,
  updateCampaign,
  deleteCampaign,
};