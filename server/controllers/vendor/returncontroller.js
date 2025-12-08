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
    if (newStatus === "Completed") {
      const subtotal = order.totalPrice; // before discount
      const finalPaidOriginal = order.finalAmount; // after discount
      const itemTotal = item.price * item.quantity;

      // Check if coupon applied
      const couponApplied = order.couponApplied === true;

      let refundAmount = 0;

      if (!couponApplied) {
        // ⭐ NO COUPON → ALWAYS FULL REFUND
        refundAmount = itemTotal;
      } else {
        // ⭐ Coupon applied → proportional refund based on ORIGINAL FINAL AMOUNT
        const totalActiveItems = order.orderedItems.filter(
          (x) => x.status !== "Cancelled" && x.returnStatus !== "Completed"
        );

        if (totalActiveItems.length === 1) {
          // Only this last item → refund entire remaining paid amount
          refundAmount = finalPaidOriginal;
        } else {
          refundAmount = Math.round((itemTotal / subtotal) * finalPaidOriginal);
        }
      }

      // Vendor balance check
      const vendorWallet = await VendorWallet.findOne({ vendorId });
      if (!vendorWallet || vendorWallet.balance < refundAmount) {
        return res.status(400).json({
          message: "Vendor does not have enough balance for refund",
        });
      }

      // Reverse vendor credit
      await reversalForOrder({
        vendorId: item.vendorID,
        orderId: order._id,
        amount: itemTotal,
        commissionPercent: 10,
      });

      item.vendorCreditStatus = "Reversed";

      // Refund to user wallet
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

      // Restore stock
      const variant = await Variant.findById(item.variantID);
      if (variant) {
        const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
        if (sizeObj) sizeObj.stock += item.quantity;
        await variant.save();
      }

      // Update status
      item.returnStatus = "Completed";
      item.refundStatus = "Completed";
      item.refundAmount = refundAmount;
      item.status = "Returned";

      await order.save();

      return res.json({
        success: true,
        message: "Return completed & refunded successfully",
        order,
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
