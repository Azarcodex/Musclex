import mongoose from "mongoose";

const tempOrderSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    orderedItems: [
      {
        productID: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        variantID: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
        vendorID: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
        categoryID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
          required: true,
        },
        brandID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Brand",
          required: true,
        },
        quantity: Number,
        price: Number,
        sizeLabel: String,
      },
    ],
    addressID: { type: mongoose.Schema.Types.ObjectId, ref: "Address" },
    shippingAddress: Object,
    couponCode: { type: String, default: null },
    totalPrice: Number,
    discount: Number,
    finalAmount: Number,
    paymentMethod: { type: String, default: "Razorpay" },
    razorpayOrderId: { type: String, default: null },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Expired"],
      default: "Pending",
    },
    orderStatus: { type: String, default: "Payment Pending" },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model("TempOrder", tempOrderSchema);
