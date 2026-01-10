import mongoose from "mongoose";

const walletLedgerSchema = new mongoose.Schema(
  {
    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Wallet",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["ADD", "DEDUCT", "REFUND", "HOLD", "RELEASE","REFERRAL"],
      required: true,
    },

    referenceId: {
      type: String,
      default: null,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("WalletLedger", walletLedgerSchema);
