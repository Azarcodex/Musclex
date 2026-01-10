import mongoose from "mongoose";

const walletSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    balance: {
      type: Number,
      default: 0,
      min: 0,
    },

    holdBalance: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["active", "blocked"],
      default: "active",
    },
    lastTransactionAt: {
      type: Date,
      default: null,
    },

    failedAttempts: {
      type: Number,
      default: 0,
    },

    lastFailedAttemptAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Wallet", walletSchema);
