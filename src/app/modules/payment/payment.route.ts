import express from "express";
import paymentController from "./payment.controller";

const router = express.Router();


router.post("/create-checkout", paymentController.createCheckoutSession);


router.post("/confirm", paymentController.confirmPayment);

export const paymentRouter =  router;