import mongoose from "mongoose";

const vendorLedgerSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },

    walletId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "VendorWallet",
      required: true,
    },

    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      default: null,
    },

    type: {
      type: String,
      enum: ["ORDER_EARNING", "REVERSAL", "WITHDRAWAL"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    note: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

export default mongoose.model("VendorLedger", vendorLedgerSchema);
