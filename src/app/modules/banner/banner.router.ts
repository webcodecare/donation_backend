import express, { NextFunction, Request, Response } from "express";
import { bannerController } from "./banner.controller";
import { upload } from "../../utils/sendImageToCloudinary";

const router = express.Router();


router.post(
  "/",
  upload.single("file"),
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
  bannerController.createBanner
);

router.get("/all", bannerController.getBanners);


router.get("/:id", bannerController.getSingleBanner);


router.patch(
  "/:id",
  upload.single("file"),
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
  bannerController.updateBanner
);

router.delete("/:id", bannerController.deleteBanner);

export const BannerRouter = router;