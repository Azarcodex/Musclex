import mongoose from "mongoose";

const couponUsageSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
      required: true,
    },

    count: {
      type: Number,
      default: 0,
    },
    usedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("CouponUsage", couponUsageSchema);
