import express from "express";
import { VendorProtection } from "../middlewares/vendors/authVendor.js";
import { Protected } from "../middlewares/admin/authMiddleware.js";
import {
  getVendorWallet,
  requestWithdrawal,
  adminApproveWithdrawal,
  adminListWithdrawals,
} from "../controllers/walletService/vendor/vendorWalletController.js";
const router = express.Router();

// ---------------- Vendor Routes ----------------

// GET vendor wallet + ledger
router.get("/", VendorProtection, getVendorWallet);

// POST vendor withdrawal request
router.post("/withdraw", VendorProtection, requestWithdrawal);

// ---------------- Admin Routes ----------------

// GET all withdrawal requests (admin only)
router.get("/admin/withdrawals", Protected, adminListWithdrawals);

// Approve withdrawal after manual payout
router.post(
  "/admin/withdrawals/:id/approve",
  Protected,
  adminApproveWithdrawal
);

export default router;
