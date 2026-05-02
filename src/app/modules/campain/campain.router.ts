import { NextFunction ,Response,Request} from "express";
import { CampaignController } from "./campain.controller";
import { upload } from "../../utils/sendImageToCloudinary";
import express from 'express';
import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

router.post(
  "/",
  auth(Role.ADMIN,Role.USER),
  upload.single("image"),
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
  CampaignController.createCampaign
)
// GET ALL
router.get("/all", CampaignController.getAllCampaigns);

// GET ONE
router.get("/:id", CampaignController.getCampaignById);

// UPDATE
router.put("/:id", upload.single("image"),
  (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.body.data) {
        req.body = JSON.parse(req.body.data);
      }
      next();
    } catch (err) {
      next(err);
    }
  }, CampaignController.updateCampaign);

// DELETE
router.delete("/:id", CampaignController.deleteCampaign);

export const campaignRouter =  router;
