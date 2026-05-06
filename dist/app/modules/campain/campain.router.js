"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.campaignRouter = void 0;
const campain_controller_1 = require("./campain.controller");
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
router.post("/", (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), sendImageToCloudinary_1.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "icons", maxCount: 20 },
]), (req, res, next) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (err) {
        next(err);
    }
}, campain_controller_1.CampaignController.createCampaign);
// GET ALL
router.get("/all", campain_controller_1.CampaignController.getAllCampaigns);
// GET ONE
router.get("/:id", campain_controller_1.CampaignController.getCampaignById);
// UPDATE
router.put("/:id", sendImageToCloudinary_1.upload.fields([
    { name: "image", maxCount: 1 },
    { name: "icons", maxCount: 20 },
]), (req, res, next) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (err) {
        next(err);
    }
}, campain_controller_1.CampaignController.updateCampaign);
// COMPLETE — admin marks campaign as successful with story + image gallery
router.patch("/:id/complete", (0, auth_1.default)(client_1.Role.ADMIN), sendImageToCloudinary_1.upload.array("successImages", 10), (req, res, next) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (err) {
        next(err);
    }
}, campain_controller_1.CampaignController.completeCampaign);
// DELETE
router.delete("/:id", campain_controller_1.CampaignController.deleteCampaign);
exports.campaignRouter = router;
