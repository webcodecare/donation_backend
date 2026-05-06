"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ItemDonation = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const sendImageToCloudinary_1 = require("../../utils/sendImageToCloudinary");
const itemDonation_controller_1 = require("./itemDonation.controller");
const router = express_1.default.Router();
/* ---------------- CREATE ITEM DONATION ---------------- */
router.post("/", (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), 
// multiple images support
sendImageToCloudinary_1.upload.array("files", 5), 
// parse JSON string from frontend FormData
(req, res, next) => {
    try {
        if (req.body.data) {
            req.body = JSON.parse(req.body.data);
        }
        next();
    }
    catch (err) {
        next(err);
    }
}, itemDonation_controller_1.ItemDonationController.createItemDonation);
router.get("/all", (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), itemDonation_controller_1.ItemDonationController.getAllItemDonations);
router.get("/my", (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), itemDonation_controller_1.ItemDonationController.getMyDonations);
router.delete("/:id", (0, auth_1.default)(client_1.Role.ADMIN, client_1.Role.USER), itemDonation_controller_1.ItemDonationController.deleteMyDonations);
router.put("/:id", (0, auth_1.default)(client_1.Role.ADMIN), itemDonation_controller_1.ItemDonationController.assignItemDonatoin);
exports.ItemDonation = router;
