import mongoose from "mongoose";

const withdrawalSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "REJECTED", "PAID"],
      default: "PENDING",
    },
    processedAt: { type: Date, default: null },
    payoutReference: { type: String, default: null },
  },
  { timestamps: true }
);

export default mongoose.model("VendorWithdrawal", withdrawalSchema);
