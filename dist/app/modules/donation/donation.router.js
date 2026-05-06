"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.donationRouter = void 0;
const express_1 = __importDefault(require("express"));
const auth_1 = __importDefault(require("../../middlewares/auth"));
const client_1 = require("@prisma/client");
const donation_controller_1 = require("./donation.controller");
const router = express_1.default.Router();
// Create donation + Stripe session
router.post("/create", (0, auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), donation_controller_1.DonationController.createDonation);
// Get all donations (admin)
router.get("/all", (0, auth_1.default)(client_1.Role.ADMIN), donation_controller_1.DonationController.getAllDonations);
// Get single donation
// router.get(
//   "/:id",
//   auth(Role.USER, Role.ADMIN),
//   DonationController.getSingleDonation
// );
// My donations
router.get("/my", (0, auth_1.default)(client_1.Role.USER, client_1.Role.ADMIN), donation_controller_1.DonationController.getMyDonations);
exports.donationRouter = router;
