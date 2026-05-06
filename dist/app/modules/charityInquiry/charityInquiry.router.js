"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharityInquiryRouter = void 0;
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = __importDefault(require("../../middlewares/auth"));
const charityInquiry_controller_1 = require("./charityInquiry.controller");
const router = express_1.default.Router();
// PUBLIC — anyone can submit an inquiry from a charity's page
router.post("/", charityInquiry_controller_1.CharityInquiryController.createInquiry);
// ADMIN — list, view, change status, delete
router.get("/", (0, auth_1.default)(client_1.Role.ADMIN), charityInquiry_controller_1.CharityInquiryController.getInquiries);
router.get("/:id", (0, auth_1.default)(client_1.Role.ADMIN), charityInquiry_controller_1.CharityInquiryController.getInquiryById);
router.patch("/:id/status", (0, auth_1.default)(client_1.Role.ADMIN), charityInquiry_controller_1.CharityInquiryController.updateInquiryStatus);
router.delete("/:id", (0, auth_1.default)(client_1.Role.ADMIN), charityInquiry_controller_1.CharityInquiryController.deleteInquiry);
exports.CharityInquiryRouter = router;
