import Order from "../../models/users/order.js";
import crypto from "crypto";
import { razorpayInstance } from "../../utils/Razorpay.js";
import { creditVendorForOrder } from "../walletService/vendor/vendorWalletService.js";
import Address from "../../models/users/address.js";
import Cart from "../../models/products/cart.js";
import Variant from "../../models/products/Variant.js";
import Coupon from "../../models/users/coupon.js";
import couponUsuage from "../../models/users/couponUsuage.js";
import TempOrder from "../../models/payment/payment.js";
export const createRazorpayOrder = async (req, res) => {
  try {
    const userID = req.user._id;
    const { amount, orderPayload } = req.body;
    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }
    const temp = await TempOrder.create({
      userID,
      orderedItems: orderPayload.orderedItems,
      addressID: orderPayload.addressID,
      shippingAddress: orderPayload.shippingAddress || null,
      couponCode: orderPayload.couponCode || null,
      totalPrice: orderPayload.totalPrice,
      discount: orderPayload.discount || 0,
      finalAmount: orderPayload.finalAmount,
      paymentMethod: "Razorpay",
      paymentStatus: "Pending",
      orderStatus: "Payment Pending",
    });
    const options = {
      amount: amount * 100, // convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now(),
    };

    const rzpOrder = await razorpayInstance.orders.create(options);
    temp.razorpayOrderId = rzpOrder.id;
    await temp.save();
    return res.status(200).json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      tempOrderId: temp._id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Razorpay order creation failed" });
  }
};

export const verifyRazorpayPayment = async (req, res) => {
  try {
    const userID = req.user._id;
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderPayload,
    } = req.body;

    // console.log("Incoming verify payload:", {
    //   razorpay_order_id,
    //   razorpay_payment_id,
    //   razorpay_signature,
    //   orderPayload,
    // });

    if (!orderPayload) {
      return res.status(400).json({
        success: false,
        message: "Missing order payload",
      });
    }

    // 1️ VERIFY SIGNATURE
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature mismatch",
      });
    }

    const { orderedItems, addressID, couponCode } = orderPayload;

    // 2️ FETCH SHIPPING ADDRESS
    const address = await Address.findById(addressID);
    if (!address) {
      return res.status(400).json({ message: "Address not found" });
    }

    // 3️ PREPARE ITEMS FOR ORDER CREATION (since front-end sends IDs)
    const finalItems = orderedItems.map((item) => ({
      productId: item.productID,
      variantId: item.variantID,
      vendorId: item.vendorID,
      quantity: item.quantity,
      price: item.price,
      sizeLabel: item.sizeLabel,
    }));

    // 4️ VALIDATE STOCK AND PREPARE ORDERED ITEMS
    const orderedItem = [];

    for (const item of finalItems) {
      const variant = await Variant.findById(item.variantId);
      if (!variant)
        return res.status(400).json({ message: "Variant not found" });

      const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
      if (!sizeObj)
        return res.status(400).json({ message: "Invalid size selected" });

      if (sizeObj.stock < item.quantity) {
        return res.status(400).json({
          message: `Stock not available for ${item.sizeLabel}`,
        });
      }

      // Reduce stock
      sizeObj.stock -= item.quantity;
      await variant.save();

      orderedItem.push({
        productID: item.productId,
        variantID: item.variantId,
        vendorID: item.vendorId,
        quantity: item.quantity,
        price: item.price,
        sizeLabel: item.sizeLabel,
        status: "Pending",
      });
    }

    // 5️ CALCULATE SUBTOTAL (before coupon)
    const subtotal = orderedItem.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    let discount = 0;

    // --------------------------------------------------
    // APPLY COUPON + VALIDATE COUPON VALIDITY
    // --------------------------------------------------

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode });
      if (!coupon)
        return res.status(400).json({ message: "Invalid coupon code" });

      const now = new Date();
      if (!coupon.isActive || now < coupon.startDate || now > coupon.endDate) {
        return res.status(400).json({ message: "Coupon not active" });
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

      // CALCULATE DISCOUNT
      if (coupon.discountType === "percent") {
        discount = Math.floor((subtotal * coupon.discountValue) / 100);
        if (coupon.maxDiscount) {
          discount = Math.min(discount, coupon.maxDiscount);
        }
      } else {
        discount = coupon.discountValue;
      }

      // UPDATE COUPON USAGE COUNTS
      coupon.usageCount += 1;
      await coupon.save();

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

    // 7️ FINAL PAYABLE AMOUNT BY USER
    const finalAmount = Math.max(subtotal - discount, 0);

    // DELIVERY DATE (5 days later)
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);

    // ---------------------------------------------
    // 8️ CREATE FINAL ORDER IN MAIN ORDER COLLECTION
    // ---------------------------------------------

    const newOrder = await Order.create({
      userID,
      addressID,
      orderedItems: orderedItem,
      shippingAddress: address,
      paymentMethod: "Razorpay",
      paymentStatus: "Paid",
      totalPrice: subtotal,
      discount,
      finalAmount,
      expectedDelivery,
      couponCode: couponCode || null,
      couponApplied: !!couponCode,
      orderStatus: "Pending",
    });

    // ------------------------------------------------
    // 9️ VENDOR CREDIT + ADMIN COMMISSION DISTRIBUTION
    // ------------------------------------------------

    const commissionPercent = 10;
    const totalDiscount = discount;

    /**
     * DISTRIBUTING COUPON DISCOUNT:
     * Each vendor should bear a discount proportional to their product contribution.
     *
     * Example:
     *   Product A = ₹100
     *   Product B = ₹200
     *   Subtotal = 300
     *   Discount = 50 (coupon)
     *
     * Product A discount = (100/300) * 50 = 16.66
     * Product B discount = (200/300) * 50 = 33.33
     */

    for (const item of newOrder.orderedItems) {
      const itemTotal = item.price * item.quantity;

      // distribute coupon discount proportionally
      const proportionalDiscount = (itemTotal / subtotal) * totalDiscount;

      // vendor receives after discount
      const receivableAfterDiscount = itemTotal - proportionalDiscount;

      // vendor final credited amount
      const vendorReceivable = receivableAfterDiscount;

      // CREDIT VENDOR WALLET
      await creditVendorForOrder({
        vendorId: item.vendorID,
        orderId: newOrder._id,
        amount: vendorReceivable,
        commissionPercent,
      });
    }

    // 1️ CLEAR CART ONLY ON FIRST SUCCESS PAYMENT
    await Cart.deleteMany({ userId: userID });

    return res.status(200).json({
      success: true,
      message: "Payment verified & order created successfully",
      order: newOrder,
    });
  } catch (err) {
    console.log("Verify error:", err);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
