"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentRouter = void 0;
const express_1 = __importDefault(require("express"));
const payment_controller_1 = __importDefault(require("./payment.controller"));
const router = express_1.default.Router();
router.post("/create-checkout", payment_controller_1.default.createCheckoutSession);
router.post("/confirm", payment_controller_1.default.confirmPayment);
exports.paymentRouter = router;
