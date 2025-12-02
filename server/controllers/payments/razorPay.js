import Order from "../../models/users/order.js";
import crypto from "crypto";
import { razorpayInstance } from "../../utils/Razorpay.js";
import { creditVendorForOrder } from "../walletService/vendor/vendorWalletService.js";
import Address from "../../models/users/address.js";
import Cart from "../../models/products/cart.js";
import Variant from "../../models/products/Variant.js";
import Coupon from "../../models/users/coupon.js";
import couponUsuage from "../../models/users/couponUsuage.js";
export const createRazorpayOrder = async (req, res) => {
  try {
    const { amount } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const order = await razorpayInstance.orders.create(options);

    return res.status(200).json({
      success: true,
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Razorpay order creation failed" });
  }
};

// export const verifyRazorpayPayment = async (req, res) => {
//   try {
//     const {
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       orderPayload,
//     } = req.body;

//     const sign = razorpay_order_id + "|" + razorpay_payment_id;

//     const expectedSign = crypto
//       .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
//       .update(sign)
//       .digest("hex");

//     if (expectedSign !== razorpay_signature) {
//       return res.status(400).json({ message: "Payment signature mismatch" });
//     }

//     // payment is VALID → now create the real order
//     const newOrder = await Order.create(orderPayload);

//     return res.status(200).json({
//       success: true,
//       message: "Payment verified, order created successfully",
//       order: newOrder,
//     });
//   } catch (err) {
//     console.log(err);
//     res.status(500).json({ message: "Verification failed" });
//   }
// };

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const userID = req.user._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload,
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({ message: "Payment signature mismatch" });
    }
    const { orderedItems, addressID, couponCode } = orderPayload;
    console.log(orderedItems, addressID, couponCode);
    const address = await Address.findById(orderPayload.addressID);
    if (!address) {
      return res.status(400).json({ message: "Address not found" });
    }
    let finalItems = [];
    if (orderedItems && orderedItems.length > 0) {
      finalItems = orderedItems;
    } else {
      finalItems = await Cart.find({ userId: userID })
        .populate("productId", "name vendorID")
        .populate("variantId", "size flavour images");
      if (!finalItems.length) {
        return res.status(400).json({ message: "Cart is Empty" });
      }
    }
    //ordered items and stock Update
    const orderedItem = [];
    for (const item of finalItems) {
      const variant = await Variant.findById(item.variantID);
      if (!variant)
        return res.status(400).json({ message: "Variant not found" });
      const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
      if (!sizeObj)
        return res.status(400).json({ message: "Invalid size selected" });
      if (sizeObj.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock not available for ${sizeObj.label}`,
        });
      }
      sizeObj.stock -= item.quantity;
      await variant.save();

      orderedItem.push({
        productID: item.productID,
        variantID: item.variantID,
        vendorID: item.vendorID,
        quantity: item.quantity,
        price: item.price,
        sizeLabel: item.sizeLabel,
        status: "Pending",
      });
    }

    //expected
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);
    const subtotal = orderedItem.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let discount = 0;

    // -------------------- 5) COUPON VALIDATION --------------------
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon)
        return res.status(400).json({ message: "Invalid coupon code" });

      const now = new Date();
      if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
        return res.status(400).json({ message: "Coupon not valid today" });
      }

      if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
        return res.status(400).json({ message: "Coupon usage limit reached" });
      }

      const usage = await couponUsuage.findOne({
        couponId: coupon._id,
        userId: userID,
      });

      if (usage && usage.count >= coupon.usagePerUser) {
        return res
          .status(400)
          .json({ message: "You already used this coupon" });
      }

      if (subtotal < coupon.minPurchase) {
        return res.status(400).json({
          message: `Minimum order value is ₹${coupon.minPurchase}`,
        });
      }

      // Discount logic
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
          userId: userID,
          count: 1,
        });
      }
    }

    const finalAmount = Math.max(subtotal - discount, 0);

    // 1️Payment valid → create order
    const newOrder = await Order.create({
      userID,
      addressID: addressID,
      orderedItems: orderedItem,
      shippingAddress: address, // FIX
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      totalPrice: subtotal,
      discount,
      finalAmount,
      expectedDelivery,
      couponCode: couponCode || null,
      couponApplied: couponCode ? true : false,
      orderStatus: "Pending",
    });
    // console.log("✅✅✅" + newOrder);
    // 2️⃣ Credit each vendor separately (multi-vendor support)
    for (const item of newOrder.orderedItems) {
      const vendorId = item.vendorID;
      const itemAmount = item.price * item.quantity;

      await creditVendorForOrder({
        vendorId,
        orderId: newOrder._id,
        amount: itemAmount, // credit only this vendor's portion
        commissionPercent: 10, // or get from env
      });
    }
    await Cart.deleteMany({ userId: userID });

    return res.status(200).json({
      success: true,
      message: "Payment verified, order created & vendor credited successfully",
      order: newOrder,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Verification failed" });
  }
};
