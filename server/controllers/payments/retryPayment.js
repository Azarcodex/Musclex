import TempOrder from "../../models/payment/payment.js";
import { razorpayInstance } from "../../utils/Razorpay.js";

export const retryPayment = async (req, res) => {
  try {
    const { tempOrderId } = req.params;

    const temp = await TempOrder.findById(tempOrderId);
    if (!temp) return res.status(404).json({ message: "Temp order not found" });

    // create new razorpay order
    const options = {
      amount: Math.round(temp.finalAmount * 100),
      currency: "INR",
      receipt: temp._id.toString(),
    };

    const rzpOrder = await razorpayInstance.orders.create(options);

    temp.razorpayOrderId = rzpOrder.id;
    temp.paymentStatus = "Pending";
    temp.orderStatus = "Payment Pending";
    await temp.save();

    return res.json({
      success: true,
      razorpayOrderId: rzpOrder.id,
      tempOrderId: temp._id,
      amount: rzpOrder.amount,
      currency: rzpOrder.currency,
    });
  } catch (err) {
    console.error("retryPayment error:", err);
    return res
      .status(500)
      .json({ message: "Failed to create retry razorpay order" });
  }
};
