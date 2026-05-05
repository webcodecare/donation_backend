import express, { NextFunction, Request, Response } from "express";
import { CharityController } from "./charity.controller";
import { upload } from "../../utils/sendImageToCloudinary";

import { Role } from "@prisma/client";
import auth from "../../middlewares/auth";

const router = express.Router();

// CREATE CHARITY
router.post(
  "/",
  auth(Role.ADMIN, Role.USER),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
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
  CharityController.createCharity
);

// GET ALL
router.get("/", CharityController.getAllCharity);

// GET SINGLE
router.get("/:id", CharityController.getSingleCharity);

// UPDATE
router.patch(
  "/:id",
  auth(Role.ADMIN, Role.USER),
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 },
  ]),
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
  CharityController.updateCharity
);

// DELETE
router.delete("/:id", auth(Role.ADMIN), CharityController.deleteCharity);

export const CharityRouter = router;