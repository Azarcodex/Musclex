import crypto from "crypto";
import TempOrder from "../../models/payment/payment.js";
import Order from "../../models/users/order.js";
import Variant from "../../models/products/Variant.js";
import Address from "../../models/users/address.js";
import Cart from "../../models/products/cart.js";
import Coupon from "../../models/users/coupon.js";
import couponUsuage from "../../models/users/couponUsuage.js";
import { creditVendorForOrder } from "../walletService/vendor/vendorWalletService.js";

export const verifyRetryPayment = async (req, res) => {
  try {
    const userID = req.user._id;

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      tempOrderId,
    } = req.body;

    // ---------------------------------------------
    // 1) VERIFY SIGNATURE
    // ---------------------------------------------
    const sign = razorpay_order_id + "|" + razorpay_payment_id;

    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(sign)
      .digest("hex");

    if (expectedSign !== razorpay_signature) {
      return res.status(400).json({
        success: false,
        message: "Payment signature mismatch",
        orderId: tempOrderId,
      });
    }

    // ---------------------------------------------
    // 2) LOAD TEMP ORDER
    // ---------------------------------------------
    const temp = await TempOrder.findById(tempOrderId);
    if (!temp) {
      return res.status(404).json({
        success: false,
        message: "Temp order not found",
        orderId: tempOrderId,
      });
    }

    // ---------------------------------------------
    // 3) BUILD ORDER ITEMS + VALIDATE STOCK
    // ---------------------------------------------
    const orderedItems = [];

    for (const item of temp.orderedItems) {
      const variant = await Variant.findById(item.variantID);
      if (!variant)
        return res.status(400).json({
          success: false,
          message: "Variant not found",
          orderId: tempOrderId,
        });

      const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
      if (!sizeObj)
        return res.status(400).json({
          success: false,
          message: "Invalid size selected",
          orderId: tempOrderId,
        });

      if (sizeObj.stock < item.quantity) {
        return res.status(400).json({
          success: false,
          message: `Stock not available for ${item.sizeLabel}`,
          orderId: tempOrderId,
        });
      }

      // Deduct stock
      sizeObj.stock -= item.quantity;
      await variant.save();

      orderedItems.push({
        productID: item.productID,
        variantID: item.variantID,
        vendorID: item.vendorID,
        categoryID: item.categoryID,
        brandID: item.brandID,
        quantity: item.quantity,
        price: item.price,
        sizeLabel: item.sizeLabel,
        status: "Pending",
      });
    }

    // ---------------------------------------------
    // 4) PRICE CALCULATION
    // ---------------------------------------------
    const subtotal = orderedItems.reduce(
      (sum, it) => sum + it.price * it.quantity,
      0
    );

    let discount = temp.discount || 0;

    // ---------------------------------------------
    // 5) COUPON VALIDATION & USAGE UPDATE
    // ---------------------------------------------
    let coupon;
    if (temp.couponCode) {
      coupon = await Coupon.findOne({ code: temp.couponCode });
      if (!coupon)
        return res.status(400).json({
          success: false,
          message: "Invalid coupon",
          orderId: tempOrderId,
        });

      if (!coupon.isActive)
        return res.status(400).json({
          success: false,
          message: "Coupon expired",
          orderId: tempOrderId,
        });

      // Check per-user usage
      const usage = await couponUsuage.findOne({
        couponId: coupon._id,
        userId: userID,
      });

      if (usage && usage.count >= coupon.usagePerUser) {
        return res.status(400).json({
          success: false,
          message: "Coupon usage limit reached",
          orderId: tempOrderId,
        });
      }

      // Update global usage
      coupon.usageCount += 1;
      await coupon.save();

      // Update per-user usage
      if (!usage) {
        await couponUsuage.create({
          couponId: coupon._id,
          userId: userID,
          count: 1,
        });
      } else {
        usage.count += 1;
        await usage.save();
      }
    }

    const finalAmount = Math.max(subtotal - discount, 0);

    // ---------------------------------------------
    // 6) FETCH ADDRESS
    // ---------------------------------------------
    const address = await Address.findById(temp.addressID);
    if (!address)
      return res.status(404).json({
        success: false,
        message: "Address not found",
        orderId: tempOrderId,
      });

    // ---------------------------------------------
    // 7) CREATE ORDER
    // ---------------------------------------------
    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);
    const orderData = {
      userID,
      addressID: address._id,
      orderedItems: orderedItems,
      shippingAddress: address,

      paymentMethod: "Razorpay",
      paymentStatus: "Paid",

      totalPrice: subtotal,
      discount: temp.couponCode ? discount : 0,
      finalAmount,
      paidAmount: finalAmount,

      couponCode: temp.couponCode || null,
      couponApplied: Boolean(temp.couponCode),

      expectedDelivery,
      orderStatus: "Pending",

      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    };

    //  store minPurchase ONLY if coupon is actually applied
    if (temp.couponCode) {
      orderData.minPurchaseforCoupon = coupon.minPurchase;
      orderData.couponValue = coupon.discountValue;
    }

    const newOrder = await Order.create(orderData);

    //-----------delete the tempOrder--------
    await TempOrder.findOneAndDelete({
      userID: userID,
      razorpayOrderId: razorpay_order_id,
    });

    // ---------------------------------------------
    // 8) CREDIT VENDORS (your commission logic stays same)
    // ---------------------------------------------
    const totalDiscount = discount;
    const commissionPercent = 10;

    for (const item of newOrder.orderedItems) {
      const itemTotal = item.price * item.quantity;

      // proportional discount per vendor
      const proportionalDiscount = Math.round(
        (itemTotal / subtotal) * totalDiscount
      );

      // amount vendor should get before admin commission
      const receivableAfterDiscount = itemTotal - proportionalDiscount;
      const discountPerItem = Math.round(proportionalDiscount / item.quantity);

      item.discountPerItem = discountPerItem;
      item.finalItemPrice = itemTotal - proportionalDiscount;
      const adminCommission =
        (receivableAfterDiscount * commissionPercent) / 100;

      const vendorReceivable = receivableAfterDiscount - adminCommission;

      await creditVendorForOrder({
        vendorId: item.vendorID,
        orderId: newOrder._id,
        amount: vendorReceivable,
        commissionPercent,
      });
    }
    await newOrder.save();
    // ---------------------------------------------
    // 9) CLEAR CART (only for cart checkout)
    // ---------------------------------------------
    await Cart.deleteMany({ userId: userID });

    return res.status(200).json({
      success: true,
      message: "Retry payment verified successfully",
      order: newOrder,
    });
  } catch (err) {
    console.log("Retry verify error:", err);
    return res.status(500).json({
      success: false,
      message: "Payment verification failed",
      orderId: req.body.tempOrderId,
    });
  }
};
