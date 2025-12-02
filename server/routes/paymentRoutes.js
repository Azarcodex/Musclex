import express from "express";
import { protectedUser } from "../middlewares/users/authUser.js";
import {
  createRazorpayOrder,
  verifyRazorpayPayment,
} from "../controllers/payments/razorPay.js";
import {
  createWalletOrder,
  verifyWalletPayment,
} from "../controllers/payments/walletPay.js";
const router = express.Router();

router.post("/create-order", protectedUser, createRazorpayOrder);
router.post("/verify", protectedUser, verifyRazorpayPayment);
router.post("/wallet/create-order", createWalletOrder);
router.post("/wallet/verify", protectedUser, verifyWalletPayment);
export default router;
