import Order from "../../models/users/order.js";
import Variant from "../../models/products/Variant.js";
import VendorWallet from "../../models/vendors/vendorWallet.js";
import VendorWalletLedger from "../../models/vendors/vendorLedger.js";
import Wallet from "../../models/wallet/walletschema.js";
import WalletLedger from "../../models/wallet/wallerLedger.js";
import { reversalForOrder } from "../walletService/vendor/vendorWalletService.js";

export const updateReturnStatusVendor = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { orderId, itemId } = req.params;
    const { newStatus, vendorReason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.orderedItems.find(
      (i) => i._id.toString() === itemId.toString()
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.vendorID.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Unauthorized vendor" });
    }

    const current = item.returnStatus;

    // Block further updates
    if (["Rejected", "Completed"].includes(current)) {
      return res.status(400).json({ message: "No further updates allowed" });
    }

    // Logic constraints
    if (current === "Requested" && newStatus === "Completed") {
      return res.status(400).json({ message: "Approve before completing" });
    }

    if (current === "Approved" && newStatus !== "Completed") {
      return res.status(400).json({
        message: "Approved return can only be marked as Completed",
      });
    }

    // -----------------------------------------
    //   REJECT RETURN
    // -----------------------------------------
    if (newStatus === "Rejected") {
      item.returnStatus = "Rejected";
      item.vendorReason = vendorReason || "";
      await order.save();

      return res.json({
        success: true,
        message: "Return rejected",
        order,
      });
    }

    // -----------------------------------------
    //   APPROVE RETURN
    // -----------------------------------------
    if (newStatus === "Approved") {
      item.returnStatus = "Approved";
      await order.save();

      return res.json({
        success: true,
        message: "Return approved",
        order,
      });
    }

    // -----------------------------------------
    //   COMPLETE RETURN (REFUND)
    // -----------------------------------------
    // -----------------------------------------
    //   COMPLETE RETURN (REFUND) — FIXED LOGIC
    // -----------------------------------------
    if (newStatus === "Completed") {
      const itemTotal = item.price * item.quantity;

      // --------------------------------------------------
      // 1) CHECK REMAINING SUBTOTAL (EXCLUDING THIS ITEM)
      // --------------------------------------------------
      let remainingSubtotal = 0;

      for (const it of order.orderedItems) {
        if (
          it._id.toString() !== itemId.toString() &&
          it.status !== "Returned"
        ) {
          remainingSubtotal += it.price * it.quantity;
        }
      }

      // --------------------------------------------------
      // 2) CHECK IF COUPON BECOMES INVALID (SAME AS CANCEL)
      // --------------------------------------------------
      let couponInvalidated = false;

      if (order.couponApplied) {
        if (remainingSubtotal < order.minPurchaseforCoupon) {
          couponInvalidated = true;
          order.couponApplied = false;
          order.couponCode = null;
        }
      }

      // --------------------------------------------------
      // 3) CALCULATE REFUND (SAME AS CANCEL)
      // --------------------------------------------------
      let refundAmount = 0;

      if (couponInvalidated && order.discount > 0) {
        const couponDiscountForItem = (itemTotal * order.couponValue) / 100;

        refundAmount = itemTotal - couponDiscountForItem;
        order.discount = 0;
      } else if (order.couponApplied) {
        refundAmount = itemTotal - (item.discountPerItem || 0);
      } else {
        refundAmount = itemTotal;
      }

      refundAmount = Math.max(refundAmount, 0);
      refundAmount = Math.min(refundAmount, order.paidAmount);

      // --------------------------------------------------
      // 4) VENDOR REVERSAL = EXACT REFUND
      // --------------------------------------------------
      const vendorReverseAmount = refundAmount;

      const vendorWallet = await VendorWallet.findOne({ vendorId });
      if (!vendorWallet || vendorWallet.balance < vendorReverseAmount) {
        return res.status(400).json({
          message: "Vendor does not have enough balance for refund",
        });
      }

      await reversalForOrder({
        vendorId: item.vendorID,
        orderId: order._id,
        amount: vendorReverseAmount,
        commissionPercent: 10,
      });

      item.vendorCreditStatus = "Reversed";

      // --------------------------------------------------
      // 5) REFUND USER WALLET
      // --------------------------------------------------
      let userWallet = await Wallet.findOne({ userId: order.userID });
      if (!userWallet) {
        userWallet = await Wallet.create({
          userId: order.userID,
          balance: 0,
        });
      }

      userWallet.balance += refundAmount;
      await userWallet.save();

      await WalletLedger.create({
        walletId: userWallet._id,
        userId: order.userID,
        amount: refundAmount,
        type: "REFUND",
        referenceId: order.orderId,
        note: `Refund for returned item ${itemId}`,
      });

      // --------------------------------------------------
      // 6) RESTORE STOCK
      // --------------------------------------------------
      const variant = await Variant.findById(item.variantID);
      if (variant) {
        const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
        if (sizeObj) sizeObj.stock += item.quantity;
        await variant.save();
      }
      order.paidAmount -= refundAmount;
      if (order.paidAmount < 0) order.paidAmount = 0;
      // --------------------------------------------------
      // 7) FINAL ITEM UPDATE
      // --------------------------------------------------
      item.returnStatus = "Completed";
      item.refundStatus = "Completed";
      item.refundAmount = refundAmount;
      item.status = "Returned";

      await order.save();

      return res.json({
        success: true,
        message: "Return completed & refunded successfully",
        refundAmount,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
