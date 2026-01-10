import mongoose from "mongoose";

const referralRewardSchema = new mongoose.Schema(
  {
    referrerUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    referredUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    rewardAmount: {
      type: Number,
      required: true,
    },

    rewardType: {
      type: String,
      enum: ["SIGNUP_REFERRER", "SIGNUP_NEW_USER"],
      required: true,
    },

    status: {
      type: String,
      enum: ["CREDITED"],
      default: "CREDITED",
    },
  },
  { timestamps: true }
);

export default mongoose.model("ReferralReward", referralRewardSchema);
