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
import {
  captureHold,
  createHold,
  releaseHold,
} from "../walletService/walletService.js";
import { reversalForOrder } from "../walletService/vendor/vendorWalletService.js";

export const OrderController = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(req.body);
    const { items, addressID, paymentMethod, couponCode } = req.body;
    console.log("🏡🏡🏡🏡🏡" + addressID);
    // console.log("✅✅✅✅" + couponCode);
    //address
    const address = await Address.findById(addressID);
    if (!address) {
      return res.status(404).json({ message: "Address not found" });
    }

    let finalItems = [];

    if (items && items.length > 0) {
      // BUY NOW
      finalItems = items;
    } else {
      // CART ORDER
      finalItems = await Cart.find({ userId })
        .populate("productId", "name vendorID")
        .populate("variantId", "size flavour images");
      if (!finalItems.length) {
        return res.status(400).json({ message: "Cart is empty" });
      }
    }

    const orderedItems = [];

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
        return res
          .status(400)
          .json({ message: `Stock not available for ${sizeObj.label}` });
      }

      sizeObj.stock -= item.quantity;
      await variant.save();

      orderedItems.push({
        productID: item.productId._id,
        variantID: item.variantId._id,
        vendorID: item.productId.vendorID,
        quantity: item.quantity,
        price: item.finalPrice,
        sizeLabel: item.sizeLabel,
        status: "Pending",
      });
    }

    const subtotal = orderedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });

      if (!coupon)
        return res.status(400).json({ message: "Invalid coupon code" });

      const now = new Date();
      if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
        return res.status(400).json({ message: "Coupon not valid today" });
      }

      // Global usage limit
      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      // Per-user usage
      const usage = await couponUsuage.findOne({
        couponId: coupon._id,
        userId,
      });

      if (usage && usage.count >= coupon.usagePerUser) {
        return res
          .status(400)
          .json({ message: "You have already used this coupon" });
      }

      // Minimum purchase
      if (subtotal < coupon.minPurchase) {
        return res.status(400).json({
          message: `Minimum order value is ₹${coupon.minPurchase}`,
        });
      }

      // Calculate discount
      if (coupon.discountType === "percent") {
        discount = Math.floor((subtotal * coupon.discountValue) / 100);

        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.discountValue;
      }

      // Update global usage
      coupon.usageCount += 1;
      await coupon.save();

      // Update per-user usage
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

    const finalAmount = Math.max(subtotal - discount, 0);

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    //WALLET SETUP
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
    // console.log("➕➕" + hold);
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
      couponApplied: true,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Pending",
      expectedDelivery,
    });

    //WALLET CAPTURE PHASE
    if (paymentMethod === "Wallet") {
      try {
        await captureHold(hold._id, orderObjectId);
        await Order.findByIdAndUpdate(orderObjectId, {
          paymentStatus: "Paid",
        });
      } catch (error) {
        console.log(error);
        await releaseHold(hold._id, "Capture failed");
        for (const item of orderedItems) {
          const variant = await Variant.findById(item.variantID);
          const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
          if (sizeObj) sizeObj.stock += item.quantity;
          await variant.save();
          return res.status(400).json({
            success: false,
            message: "Wallet payment failed!!!",
          });
        }
      }
    }

    //CLEAR CART
    await Cart.deleteMany({ userId });

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      message: "Internal Server Error",
    });
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
    res.status(200).json({ success: true, message: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
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

    // 1RESTORE STOCK
    for (const item of order.orderedItems) {
      const variant = await Variant.findById(item.variantID);
      if (!variant) continue;

      const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
      if (sizeObj) sizeObj.stock += item.quantity;
      await variant.save();
    }

    //  REVERSE VENDOR CREDIT (IF RAZORPAY)
    if (order.paymentMethod === "Razorpay") {
      for (const item of order.orderedItems) {
        const amt = item.price * item.quantity;

        await reversalForOrder({
          vendorId: item.vendorID,
          orderId: order._id,
          amount: amt,
          commissionPercent: 10,
        });

        item.vendorCreditStatus = "Reversed";
      }
    }

    // 3 REFUND CUSTOMER
    const refundAmount = order.finalAmount;

    if (refundAmount > 0) {
      const wallet = await Wallet.findOne({ userId });
      wallet.balance += refundAmount;
      await wallet.save();
    }

    for (const item of order.orderedItems) {
      item.refundAmount = item.price * item.quantity;
      item.refundStatus = "Completed";
    }

    order.paymentStatus = "Refunded";
    order.orderStatus = "Cancelled";

    await order.save();

    return res.json({
      success: true,
      message: "Order cancelled and refunded successfully",
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

    // 1️RESTOCK
    const variant = await Variant.findById(item.variantID);
    const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
    if (sizeObj) sizeObj.stock += item.quantity;
    await variant.save();

    // 2️ REVERSE VENDOR CREDIT (Razorpay)
    if (order.paymentMethod === "Razorpay") {
      await reversalForOrder({
        vendorId: item.vendorID,
        orderId: order._id,
        amount: item.price * item.quantity,
        commissionPercent: 10,
      });

      item.vendorCreditStatus = "Reversed";
    }

    // 3️ REFUND CUSTOMER
    const refundAmt = item.price * item.quantity;
    const wallet = await Wallet.findOne({ userId });
    wallet.balance += refundAmt;
    await wallet.save();

    item.refundAmount = refundAmt;
    item.refundStatus = "Completed";
    item.status = "Cancelled";

    // Update order-level amount
    order.finalAmount -= refundAmt;

    // If all items cancelled → order cancelled
    const allCancelled = order.orderedItems.every(
      (it) => it.status === "Cancelled"
    );
    if (allCancelled) order.orderStatus = "Cancelled";

    await order.save();

    return res.json({
      success: true,
      message: "Item cancelled and refunded",
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
    item.vendorCreditStatus = "PENDING"; // vendor reversal after admin approval

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
