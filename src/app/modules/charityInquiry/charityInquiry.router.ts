import express from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import { CharityInquiryController } from "./charityInquiry.controller";

const router = express.Router();

// PUBLIC — anyone can submit an inquiry from a charity's page
router.post("/", CharityInquiryController.createInquiry);

// ADMIN — list, view, change status, delete
router.get("/", auth(Role.ADMIN), CharityInquiryController.getInquiries);
router.get("/:id", auth(Role.ADMIN), CharityInquiryController.getInquiryById);
router.patch("/:id/status", auth(Role.ADMIN), CharityInquiryController.updateInquiryStatus);
router.delete("/:id", auth(Role.ADMIN), CharityInquiryController.deleteInquiry);

export const CharityInquiryRouter = router;
