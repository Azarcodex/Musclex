import Order from "../../models/users/order.js";
import Variant from "../../models/products/Variant.js";
import VendorWallet from "../../models/vendors/vendorWallet.js";
import VendorWalletLedger from "../../models/vendors/vendorLedger.js";
import Wallet from "../../models/wallet/walletschema.js";
// export const updateReturnStatusVendor = async (req, res) => {
//   try {
//     const vendorId = req.vendor._id;
//     const { orderId, itemId } = req.params;
//     const { newStatus } = req.body;
//     // if (req.body.vendorReason) {
//     //   const { vendorReason } = req.body;
//     // }
//     const order = await Order.findById(orderId);
//     if (!order) return res.status(404).json({ message: "Order not found" });

//     const item = order.orderedItems.find(
//       (item) => item._id.toString() === itemId
//     );
//     if (!item) return res.status(404).json({ message: "Item not found" });

//     if (item.vendorID.toString() !== vendorId.toString()) {
//       return res.status(403).json({ message: "Unauthorized vendor" });
//     }

//     const current = item.returnStatus;

//     if (current === "Rejected" || current === "Completed") {
//       return res.status(400).json({ message: "No further updates allowed" });
//     }

//     if (current === "Requested" && newStatus === "Completed") {
//       return res.status(400).json({ message: "Approve before completing" });
//     }

//     if (current === "Approved" && newStatus !== "Completed") {
//       return res.status(400).json({
//         message: "Approved return can only be marked as Completed",
//       });
//     }

//     item.returnStatus = newStatus;

//     if (newStatus === "Completed") {
//       const variant = await Variant.findById(item.variantID);
//       if (variant) {
//         const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
//         if (sizeObj) sizeObj.stock += item.quantity;
//         await variant.save();
//       }

//       item.refundStatus = "Pending";
//     }
//     if (newStatus === "Rejected") {
//       item.vendorReason = req.body.vendorReason;
//     }

//     await order.save();

//     res.json({
//       success: true,
//       message: "Return status updated",
//       order,
//     });
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ message: "Internal Server Error" });
//   }
// };

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

    // Prevent further changes
    if (["Rejected", "Completed"].includes(current)) {
      return res.status(400).json({ message: "No further updates allowed" });
    }

    // Logical flow checks
    if (current === "Requested" && newStatus === "Completed") {
      return res.status(400).json({ message: "Approve before completing" });
    }

    if (current === "Approved" && newStatus !== "Completed") {
      return res.status(400).json({
        message: "Approved return can only be marked as Completed",
      });
    }

    // Handle REJECT
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

    // Handle APPROVE
    if (newStatus === "Approved") {
      item.returnStatus = "Approved";
      await order.save();

      return res.json({
        success: true,
        message: "Return approved",
        order,
      });
    }

    // Handle COMPLETE (refund)
    if (newStatus === "Completed") {
      const refundAmount = item.price * item.quantity;

      // Vendor must have full balance
      const vendorWallet = await VendorWallet.findOne({ vendorId });
      if (!vendorWallet) {
        return res.status(400).json({ message: "Vendor wallet not found" });
      }

      if (vendorWallet.balance < refundAmount) {
        return res.status(400).json({
          message: "Vendor does not have enough balance for refund",
        });
      }

      // Deduct vendor wallet
      vendorWallet.balance -= refundAmount;
      await vendorWallet.save();

      // Vendor ledger entry
      await VendorWalletLedger.create({
        vendorWalletId: vendorWallet._id,
        vendorId,
        orderId: order._id,
        amount: refundAmount,
        type: "REVERSAL",
        note: `Refund for returned item ${itemId}`,
      });

      // Refund to USER wallet
      let userWallet = await Wallet.findOne({ userId: order.userID });
      if (!userWallet) {
        userWallet = await Wallet.create({
          userId: order.userID,
          balance: 0,
        });
      }

      userWallet.balance += refundAmount;
      await userWallet.save();

      // User ledger entry
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

      // Update item fields
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
