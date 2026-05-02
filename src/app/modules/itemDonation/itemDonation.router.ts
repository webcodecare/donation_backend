import { NextFunction, Response, Request } from "express";
import express from "express";
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";
import { upload } from "../../utils/sendImageToCloudinary";
import { ItemDonationController } from "./itemDonation.controller";

const router = express.Router();

/* ---------------- CREATE ITEM DONATION ---------------- */
router.post(
  "/",
  auth(Role.ADMIN, Role.USER),

  // multiple images support
  upload.array("files", 5),

  // parse JSON string from frontend FormData
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch (err) {
      next(err);
    }
  },

  ItemDonationController.createItemDonation
);

router.get(
  "/all",
  auth(Role.ADMIN, Role.USER),
  ItemDonationController.getAllItemDonations)
router.get(
  "/my",
  auth(Role.ADMIN, Role.USER),
  ItemDonationController.getMyDonations)

router.delete(
  "/:id",
  auth(Role.ADMIN, Role.USER),
  ItemDonationController.deleteMyDonations)
router.put(
  "/:id", auth(Role.ADMIN),
  ItemDonationController.assignItemDonatoin)


export const ItemDonation = router;