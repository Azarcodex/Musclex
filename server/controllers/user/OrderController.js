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
        .populate("productId", "name vendorID brandID catgid")
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
      // sizeObj.stock -= item.quantity;
      // await variant.save();

      tempItems.push({
        productID: item.productId._id,
        variantID: item.variantId._id,
        vendorID: item.productId.vendorID,
        categoryID: item.productId.catgid._id,
        brandID: item.productId.brandID._id,
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
    let coupon;
    if (couponCode) {
      coupon = await Coupon.findOne({ code: couponCode });
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
    }

    // -----------------------------------------
    // STEP 4: SPLIT DISCOUNT PER ITEM
    // -----------------------------------------
    let remainingDiscount = discount;

    const orderedItems = tempItems.map((item, index) => {
      const itemTotal = item.price * item.quantity;
      let itemDiscount = 0;

      if (discount > 0 && subtotal > 0) {
        itemDiscount = Math.floor((itemTotal / subtotal) * discount);
        itemDiscount = Math.min(itemDiscount, itemTotal);
      }

      // Assign rounding remainder to last item
      if (index === tempItems.length - 1) {
        itemDiscount = Math.min(remainingDiscount, itemTotal);
      }

      remainingDiscount -= itemDiscount;

      return {
        ...item,
        discountPerItem: itemDiscount,
        commissionPercent: 10, // FIXED COMMISSION
      };
    });

    // -----------------------------------------
    // FINAL AMOUNT
    // -----------------------------------------
    const finalAmount = Math.max(subtotal - discount, 0);

    if (paymentMethod === "COD" && finalAmount > 1000) {
      return res.status(400).json({
        message: "Cash on Delivery is not available for orders above ₹1000",
      });
    }

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
    const orderData = {
      _id: orderObjectId,
      userID: userId,
      addressID,
      orderedItems,
      shippingAddress: address,
      totalPrice: subtotal,
      discount: couponCode ? discount : 0,
      finalAmount,
      paidAmount: finalAmount,
      couponCode: couponCode || null,
      couponApplied: Boolean(couponCode),
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Pending",
      expectedDelivery,
    };

    // only attach coupon rule if coupon actually used
    if (couponCode) {
      orderData.minPurchaseforCoupon = coupon.minPurchase;
      orderData.couponValue = coupon.discountValue;
    }

    const order = await Order.create(orderData);

    //coupon user mnagement

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      await Coupon.findByIdAndUpdate(coupon._id, {
        $inc: { usageCount: 1 },
      });

      await couponUsuage.findOneAndUpdate(
        { couponId: coupon._id, userId },
        { $inc: { count: 1 } },
        { upsert: true }
      );
    }

    //validating variant
    for (const item of orderedItems) {
      const variant = await Variant.findById(item.variantID);
      const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
      if (!sizeObj || sizeObj.stock < item.quantity) {
        throw new Error("Stock inconsistency detected");
      }
      sizeObj.stock -= item.quantity;
      await variant.save();
    }

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
      razorpayOrderId: orderDetails?.razorpayOrderId,
      razorpayPaymentId: orderDetails?.razorpayPaymentId,
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
          "Order cannot be cancelled because one or more items are already Shipped/Delivered/Returned.",
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
        const netAmount =
          item.price * item.quantity - (item.discountPerItem || 0);

        await reversalForOrder({
          vendorId: item.vendorID,
          orderId: order._id,
          amount: Math.max(netAmount, 0),
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
    const refundAmount = order.paidAmount;

    if (
      (order.paymentMethod === "Razorpay" ||
        order.paymentMethod === "Wallet") &&
      order.paymentStatus === "Paid"
    ) {
      const wallet = await Wallet.findOne({ userId });
      wallet.balance += refundAmount;
      await wallet.save();

      await WalletLedger.create({
        walletId: wallet._id,
        userId,
        amount: refundAmount,
        type: "ADD",
        referenceId: `FULL_ORDER_REFUND_${order._id}`,
        note: "Refund for full order cancellation",
      });

      for (const item of order.orderedItems) {
        item.refundAmount = 0; // avoid mismatch
        item.refundStatus = "Completed";
      }

      order.paymentStatus = "Refunded";
    }

    // ---------------------------------------------
    // 4) FINAL CLEANUP
    // ---------------------------------------------
    order.finalAmount = 0;
    order.discount = 0;
    order.couponApplied = false;
    order.couponCode = null;
    order.paidAmount = 0;
    order.orderStatus = "Cancelled";

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
    const { reason } = req.body;

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
    // 2) MARK ITEM CANCELLED
    // ------------------------------------------------------------
    item.status = "Cancelled";
    item.cancelReason = reason;

    // ------------------------------------------------------------
    // 3) CHECK IF COUPON BECOMES INVALID
    // ------------------------------------------------------------
    let couponInvalidated = false;

    if (order.couponApplied) {
      let remainingSubtotal = 0;

      for (const it of order.orderedItems) {
        if (it.status !== "Cancelled") {
          remainingSubtotal += it.price * it.quantity;
        }
      }

      if (remainingSubtotal < order.minPurchaseforCoupon) {
        couponInvalidated = true;
        order.couponApplied = false;
        order.couponCode = null;
      }
    }

    // ------------------------------------------------------------
    // 4) CALCULATE REFUND (USING discountPerItem ONLY)
    // ------------------------------------------------------------
    let refundAmt = 0;

    if (
      (order.paymentMethod === "Razorpay" ||
        order.paymentMethod === "Wallet") &&
      order.paymentStatus === "Paid"
    ) {
      const itemTotal = item.price * item.quantity;

      if (couponInvalidated && order.discount > 0) {
        // Coupon broken → recover full coupon from THIS item
        const couponDiscountForItem = (itemTotal * order.couponValue) / 100;

        refundAmt = itemTotal - couponDiscountForItem;
        order.discount = 0;
      } else if (order.couponApplied) {
        // Normal case → per item refund
        refundAmt = itemTotal - (item.discountPerItem || 0);
      } else {
        refundAmt = itemTotal;
      }

      refundAmt = Math.max(refundAmt, 0);
      refundAmt = Math.min(refundAmt, order.paidAmount);

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
      item.refundAmount = 0;
      item.refundStatus = "Not Applicable";
    }

    // ------------------------------------------------------------
    // 5) UPDATE PAID AMOUNT (NO finalAmount RECOMPUTE)
    // ------------------------------------------------------------
    order.paidAmount -= refundAmt;
    if (order.paidAmount < 0) order.paidAmount = 0;

    // ------------------------------------------------------------
    // 6) FINAL ORDER STATUS
    // ------------------------------------------------------------
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
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//return controller
export const returnOrderItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, itemId } = req.params;
    const { reason } = req.body;
    // console.log("✅✅✅✅🏡" + reason);
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
