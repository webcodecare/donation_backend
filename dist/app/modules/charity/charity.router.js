"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharityRouter = void 0;
const express_1 = __importDefault(require("express"));
const charity_controller_1 = require("./charity.controller");
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const router = express_1.default.Router();
// CREATE CHARITY
router.post("/", (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), sendImageToCloudinary_1.upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
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
}, charity_controller_1.CharityController.createCharity);
// GET ALL
router.get("/", charity_controller_1.CharityController.getAllCharity);
// GET SINGLE
router.get("/:id", charity_controller_1.CharityController.getSingleCharity);
// UPDATE
router.patch("/:id", (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), sendImageToCloudinary_1.upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
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
}, charity_controller_1.CharityController.updateCharity);
// DELETE
router.delete("/:id", (0, auth_1.default)(client_1.Role.ADMIN), charity_controller_1.CharityController.deleteCharity);
exports.CharityRouter = router;
