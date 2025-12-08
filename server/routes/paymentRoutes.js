import express from "express";
import { protectedUser } from "../middlewares/users/authUser.js";

import {
  createWalletOrder,
  verifyWalletPayment,
} from "../controllers/payments/walletPay.js";
import { getTempOrder } from "../controllers/payments/getTemp.js";
import { retryPayment } from "../controllers/payments/retryPayment.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/payments/razorPay.js";
import { verifyRetryPayment } from "../controllers/payments/verify-retry.js";
const router = express.Router();

router.post("/user/wallet/create-order", protectedUser, createWalletOrder);
router.post("/wallet/verify", protectedUser, verifyWalletPayment);

//razorpay

router.post("/create-razorpay-order", protectedUser, createRazorpayOrder);

// Verify FIRST payment attempt
router.post("/verify-payment", protectedUser, verifyRazorpayPayment);

// Retry → Create NEW Razorpay Order
router.post("/retry/:tempOrderId", protectedUser, retryPayment);

// Verify retry payment
router.post("/verify-retry", protectedUser, verifyRetryPayment);

// Fetch TempOrder data for Failed Page
router.get("/temporder/:tempOrderId", protectedUser, getTempOrder);

export default router;
