"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BannerRouter = void 0;
const express_1 = __importDefault(require("express"));
const banner_controller_1 = require("./banner.controller");
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const router = express_1.default.Router();
router.post("/", sendImageToCloudinary_1.upload.single("file"), (req, res, next) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (err) {
        next(err);
    }
}, banner_controller_1.bannerController.createBanner);
router.get("/all", banner_controller_1.bannerController.getBanners);
router.get("/:id", banner_controller_1.bannerController.getSingleBanner);
router.patch("/:id", sendImageToCloudinary_1.upload.single("file"), (req, res, next) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (err) {
        next(err);
    }
}, banner_controller_1.bannerController.updateBanner);
router.delete("/:id", banner_controller_1.bannerController.deleteBanner);
exports.BannerRouter = router;
