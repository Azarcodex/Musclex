import mongoose from "mongoose";
import Cart from "../../models/products/cart.js";
import Variant from "../../models/products/Variant.js";
import Address from "../../models/users/address.js";
import Coupon from "../../models/users/coupon.js";
import couponUsuage from "../../models/users/couponUsuage.js";
import Order from "../../models/users/order.js";
import User from "../../models/users/user.js";
import { computeOrderStatus } from "./computation/status.js";
import Wallet from "../../models/wallet/walletschema.js";
import WalletLedger from "../../models/wallet/wallerLedger.js";
import {
  captureHold,
  createHold,
  createLedgerEntry,
  releaseHold,
} from "../walletService/walletService.js";
import { reversalForOrder } from "../walletService/vendor/vendorWalletService.js";

export const statusPriority = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Returned",
  "Cancelled",
];

export const OrderController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, addressID, paymentMethod, couponCode } = req.body;

    // FETCH ADDRESS
    const address = await Address.findById(addressID);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    // DETERMINE FINAL ITEMS (BUY NOW / CART)
    let finalItems = [];
    if (items && items.length > 0) {
      finalItems = items;
    } else {
      finalItems = await Cart.find({ userId })
        .populate("productId", "name vendorID")
        .populate("variantId", "size flavour images");

      if (!finalItems.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }
    }

    // -----------------------------------------
    // STEP 1: VALIDATE STOCK & BUILD BASIC ITEMS
    // -----------------------------------------
    const tempItems = [];

    for (const item of finalItems) {
      const variant = await Variant.findById(item.variantId);
      if (!variant) {
        return res.status(400).json({ message: "Variant not found" });
      }

      const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
      if (!sizeObj) {
        return res.status(400).json({ message: "Invalid size selected" });
      }

      if (sizeObj.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock not available for ${sizeObj.label}`,
        });
      }

      // Deduct stock
      sizeObj.stock -= item.quantity;
      await variant.save();

      tempItems.push({
        productID: item.productId._id,
        variantID: item.variantId._id,
        vendorID: item.productId.vendorID,
        quantity: item.quantity,
        price: item.finalPrice,
        sizeLabel: item.sizeLabel,
        status: "Pending",
      });
    }

    // -----------------------------------------
    // STEP 2: CALCULATE SUBTOTAL
    // -----------------------------------------
    const subtotal = tempItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    // -----------------------------------------
    // STEP 3: COUPON DISCOUNT CALCULATION
    // -----------------------------------------
    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon) return res.status(400).json({ message: "Invalid coupon" });

      const now = new Date();
      if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
        return res.status(400).json({ message: "Coupon not valid today" });
      }

      // Global usage check
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      // User usage check
      const usage = await couponUsuage.findOne({
        couponId: coupon._id,
        userId,
      });

      if (usage && usage.count >= coupon.usagePerUser) {
        return res
          .status(400)
          .json({ message: "You already used this coupon" });
      }

      // Min purchase check
      if (subtotal < coupon.minPurchase) {
        return res.status(400).json({
          message: `Minimum order value is ₹${coupon.minPurchase}`,
        });
      }

      // Discount calculation
      if (coupon.discountType === "percent") {
        discount = Math.floor((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.discountValue;
      }

      // Update coupon usage
      coupon.usageCount += 1;
      await coupon.save();

      if (usage) {
        usage.count += 1;
        await usage.save();
      } else {
        await couponUsuage.create({
          couponId: coupon._id,
          userId,
          count: 1,
        });
      }
    }

    // -----------------------------------------
    // STEP 4: SPLIT DISCOUNT PER ITEM
    // -----------------------------------------
    const totalQty = tempItems.reduce((acc, item) => acc + item.quantity, 0);

    let discountPerItem = 0;
    if (discount > 0 && totalQty > 0) {
      discountPerItem = discount / totalQty;
    }

    // -----------------------------------------
    // STEP 5: BUILD FINAL orderedItems WITH COMMISSION & DISCOUNT SPLIT
    // -----------------------------------------
    const orderedItems = tempItems.map((item) => ({
      ...item,
      discountPerItem: discountPerItem,
      commissionPercent: 10, // FIXED COMMISSION
    }));

    // -----------------------------------------
    // FINAL AMOUNT
    // -----------------------------------------
    const finalAmount = Math.max(subtotal - discount, 0);

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    // -----------------------------------------
    // WALLET PAYMENT
    // -----------------------------------------
    const orderObjectId = new mongoose.Types.ObjectId();
    let hold = null;

    if (paymentMethod === "Wallet") {
      try {
        hold = await createHold(
          userId,
          orderObjectId,
          finalAmount,
          orderObjectId
        );
      } catch (error) {
        return res.status(400).json({
          success: false,
          message: error.message || "Wallet hold failed",
        });
      }
    }

    // -----------------------------------------
    // CREATE ORDER
    // -----------------------------------------
    const order = await Order.create({
      _id: orderObjectId,
      userID: userId,
      addressID: addressID,
      orderedItems,
      shippingAddress: address,
      totalPrice: subtotal,
      discount,
      finalAmount,
      couponCode: couponCode || null,
      couponApplied: Boolean(couponCode),
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Pending",
      expectedDelivery,
    });

    // CAPTURE WALLET HOLD
    if (paymentMethod === "Wallet") {
      try {
        await captureHold(hold._id, orderObjectId);
        await Order.findByIdAndUpdate(orderObjectId, { paymentStatus: "Paid" });
      } catch (error) {
        await releaseHold(hold._id, "Capture failed");

        // Restore stock
        for (const item of orderedItems) {
          const variant = await Variant.findById(item.variantID);
          const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
          if (sizeObj) sizeObj.stock += item.quantity;
          await variant.save();
        }

        return res.status(400).json({
          success: false,
          message: "Wallet payment failed!",
        });
      }
    }

    // CLEAR CART
    await Cart.deleteMany({ userId });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export const orderSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const user = await User.findById(userId);
    const orderDetails = await Order.findOne({ userID: userId, _id: id });
    const response = {
      totalPrice: orderDetails.totalPrice,
      finalAmount: orderDetails.finalAmount,
      couponApplied: orderDetails.couponApplied,
      orderId: orderDetails.orderId,
      user: user.email,
      expectedDelivery: orderDetails?.expectedDelivery,
    };
    res.status(200).json({ success: true, result: response });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//order track and orders
export const getOrderList = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userID: userId })
      .populate({
        path: "orderedItems.productID",
        select: "name brandID catgid",
        populate: [
          { path: "catgid", select: "catgName" },
          { path: "brandID", select: "brand_name" },
        ],
      })
      .populate({
        path: "orderedItems.variantID",
        select: "flavour size images",
      })
      .sort({ createdAt: -1 })
      .lean();

    const formatted = orders.map((order) => ({
      ...order,
      coupon: {
        applied: order.couponApplied,
        code: order.couponCode,
        discountAmount: order.discount,
      },
    }));

    return res.status(200).json({
      success: true,
      message: formatted,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//orderTrackage
export const OrderTrack = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const orders = await Order.find({ userID: userId, _id: id })
      .populate({
        path: "orderedItems.productID",
        select: "name brandID catgid",
        populate: [
          { path: "catgid", select: "catgName" },
          { path: "brandID", select: "brand_name" },
        ],
      })
      .populate({
        path: "orderedItems.variantID",
        select: "flavour size images",
      })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, message: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//cancel order dealing

export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;

    const order = await Order.findOne({ _id: id, userID: userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const cancellableStatuses = ["Pending", "Confirmed", "Processing"];
    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        message: `Order cannot be cancelled once it is ${order.orderStatus}`,
      });
    }

    const blockedStatuses = [
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Returned",
    ];

    const blockedItem = order.orderedItems.some((item) =>
      blockedStatuses.includes(item.status)
    );

    if (blockedItem) {
      return res.status(400).json({
        success: false,
        message:
          "Order cannot be cancelled because one or more items are already Shipped/Delivered.",
      });
    }

    // ---------------------------------------------
    // 1) CANCEL EACH ITEM + RESTORE STOCK ONCE
    // ---------------------------------------------
    for (const item of order.orderedItems) {
      if (item.status !== "Cancelled") item.status = "Cancelled";

      if (!item.StockRestored) {
        const variant = await Variant.findById(item.variantID);
        if (variant) {
          const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
          if (sizeObj) sizeObj.stock += item.quantity;
          await variant.save();
        }
        item.StockRestored = true;
      }
    }

    // ---------------------------------------------
    // 2) VENDOR REVERSAL (only Razorpay PAID)
    // ---------------------------------------------
    if (order.paymentMethod === "Razorpay" && order.paymentStatus === "Paid") {
      for (const item of order.orderedItems) {
        await reversalForOrder({
          vendorId: item.vendorID,
          orderId: order._id,
          amount: item.price * item.quantity,
          commissionPercent: 10,
        });
        item.vendorCreditStatus = "Reversed";
      }
    } else {
      for (const item of order.orderedItems) {
        item.vendorCreditStatus = "Not Applicable";
      }
    }

    // ---------------------------------------------
    // 3) REFUND USER (wallet or razorpay)
    // ---------------------------------------------
    const refundAmount = order.finalAmount;

    const shouldRefund =
      (order.paymentMethod === "Razorpay" ||
        order.paymentMethod === "Wallet") &&
      order.paymentStatus === "Paid";

    if (shouldRefund) {
      const wallet = await Wallet.findOne({ userId });
      wallet.balance += refundAmount;
      await wallet.save();

      const referenceId =
        order.paymentMethod === "Razorpay"
          ? `RAZORPAY_REFUND_${order._id}`
          : `WALLET_REFUND_${order._id}`;

      await WalletLedger.create({
        walletId: wallet._id,
        userId,
        amount: refundAmount,
        type: "ADD",
        referenceId,
        note: "Refund for full order cancellation",
      });

      for (const item of order.orderedItems) {
        item.refundAmount = item.price * item.quantity;
        item.refundStatus = "Completed";
      }

      order.paymentStatus = "Refunded";
    } else {
      for (const item of order.orderedItems) {
        item.refundAmount = 0;
        item.refundStatus = "Not Applicable";
      }
      order.paymentStatus = "Not Applicable";
    }

    // ---------------------------------------------
    // 4) UPDATE ORDER STATUS USING computeOrderStatus()
    // ---------------------------------------------
    order.orderStatus = computeOrderStatus(order.orderedItems);

    await order.save();

    return res.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//canceling individual product
export const cancelProductOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, item_id } = req.params;

    const order = await Order.findOne({ _id: orderId, userID: userId });
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.orderedItems.find(
      (it) => it._id.toString() === item_id.toString()
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    const cancellable = ["Pending", "Confirmed", "Processing"];
    if (!cancellable.includes(item.status)) {
      return res.status(400).json({
        message: `Item cannot be cancelled once it is ${item.status}`,
      });
    }

    // ------------------------------------------------------------
    // 1) RESTORE STOCK
    // ------------------------------------------------------------
    if (!item.StockRestored) {
      const variant = await Variant.findById(item.variantID);
      const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
      if (sizeObj) sizeObj.stock += item.quantity;
      await variant.save();
      item.StockRestored = true;
    }

    // ------------------------------------------------------------
    // 2) REVERSE VENDOR CREDIT
    // ------------------------------------------------------------
    if (order.paymentMethod === "Razorpay" && order.paymentStatus === "Paid") {
      await reversalForOrder({
        vendorId: item.vendorID,
        orderId: order._id,
        amount: item.price * item.quantity,
        commissionPercent: 10,
      });

      item.vendorCreditStatus = "Reversed";
    } else {
      item.vendorCreditStatus = "Not Applicable";
    }

    // ------------------------------------------------------------
    // 3) REFUND CALCULATION
    //
    // ------------------------------------------------------------
    let refundAmt = 0;

    if (
      (order.paymentMethod === "Razorpay" ||
        order.paymentMethod === "Wallet") &&
      order.paymentStatus === "Paid"
    ) {
      refundAmt = item.price * item.quantity;

      // --- COUPON SHARE ADJUSTMENT ---
      if (order.couponApplied && order.discount > 0) {
        const itemTotal = item.price * item.quantity;
        const totalOrderItemsAmount = order.orderedItems.reduce(
          (sum, it) => sum + it.price * it.quantity,
          0
        );

        // proportional discount share
        const itemDiscountShare =
          (itemTotal / totalOrderItemsAmount) * order.discount;

        refundAmt = itemTotal - itemDiscountShare;
        refundAmt = Math.max(Math.floor(refundAmt), 0);
      }

      // Deposit refund into wallet
      const wallet = await Wallet.findOne({ userId });
      wallet.balance += refundAmt;
      await wallet.save();

      await WalletLedger.create({
        walletId: wallet._id,
        userId,
        amount: refundAmt,
        type: "ADD",
        referenceId:
          order.paymentMethod === "Razorpay"
            ? order.paymentId || "RAZORPAY_REFUND"
            : "WALLET_REFUND",
        note: "Refund for item cancellation",
      });

      item.refundAmount = refundAmt;
      item.refundStatus = "Completed";
    } else {
      // COD or unpaid → no refund
      item.refundAmount = 0;
      item.refundStatus = "Not Applicable";
    }

    // ------------------------------------------------------------
    // 4) UPDATE ORDER TOTAL
    // ------------------------------------------------------------
    order.finalAmount -= refundAmt;
    if (order.finalAmount < 0) order.finalAmount = 0;

    // Mark item cancelled
    item.status = "Cancelled";

    // If all items cancelled → cancel whole order
    const allCancelled = order.orderedItems.every(
      (it) => it.status === "Cancelled"
    );
    if (allCancelled) order.orderStatus = "Cancelled";

    await order.save();

    return res.json({
      success: true,
      message:
        refundAmt > 0
          ? "Item cancelled & refunded to wallet"
          : "Item cancelled successfully",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//return controller
export const returnOrderItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, itemId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.userID.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const item = order.orderedItems.find((it) => it._id.toString() === itemId);
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // Only delivered items can be returned
    if (item.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Return only allowed after delivery",
      });
    }

    if (!item.deliveredDate) {
      return res.status(400).json({
        success: false,
        message: "Delivery date missing. Cannot process return.",
      });
    }

    // Apply 7-day return policy
    const now = new Date();
    const daysSinceDelivery =
      (now - new Date(item.deliveredDate)) / (1000 * 60 * 60 * 24);

    if (daysSinceDelivery > 7) {
      return res.status(400).json({
        success: false,
        message: "Return window expired (only 7 days allowed).",
      });
    }

    // Mark item as returned REQUEST
    item.status = "Returned";
    item.returnStatus = "Requested";
    item.returnReason = reason;
    item.returnDate = now;

    // Mark refund and vendor adjustments as pending
    item.refundStatus = "Pending"; // user refund will be done after approval
    item.vendorCreditStatus = "NotCredited"; // vendor reversal after admin approval

    order.orderStatus = computeOrderStatus(order.orderedItems);

    await order.save();

    return res.json({
      success: true,
      message: "Return requested successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
