import mongoose from "mongoose";
const otpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    otp: {
      type: String,
      required: true,
    },
    otpCreated: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    pendingData: {
      name: {
        type: String,
      },
      email: {
        type: String,
      },
      password: {
        type: String,
      },
      referralCode: {
        type: String,
      },
    },
  },
  { timestamps: true }
);

const OTP = mongoose.model("OTP", otpSchema);
export default OTP;
