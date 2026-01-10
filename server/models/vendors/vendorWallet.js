import mongoose from "mongoose";

const vendorWalletSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
      unique: true,
    },
    balance: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("VendorWallet", vendorWalletSchema);
