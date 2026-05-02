import express from "express";
import auth from "../../middlewares/auth";
import { Role } from "@prisma/client";
import { DonationController } from "./donation.controller";

const router = express.Router();

// Create donation + Stripe session
router.post(
  "/create",
  auth(Role.USER, Role.ADMIN),
  DonationController.createDonation
);

// Get all donations (admin)
router.get(
  "/",
  auth(Role.ADMIN),
  DonationController.getAllDonations
);

// Get single donation
// router.get(
//   "/:id",
//   auth(Role.USER, Role.ADMIN),
//   DonationController.getSingleDonation
// );

// My donations
router.get(
  "/my",
  auth(Role.USER,Role.ADMIN),
  DonationController.getMyDonations
);

export const donationRouter =  router;