import mongoose from "mongoose";
import crypto from "crypto"; 

const orderedItemSchema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantID: { type: mongoose.Schema.Types.ObjectId, ref: "Variant" },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  status: {
    type: String,
    enum: [
      "Pending",
      "Processing",
      "Shipped",
      "Delivered",
      "Cancelled",
      "Returned",
    ],
    default: "Pending",
  },
  deliveryDate: { type: Date },
  cancellationReason: { type: String },
  returnReason: { type: String },
});

const shippingAddressSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  pincode: { type: String, required: true },
  state: { type: String, required: true },
  city: { type: String, required: true },
  addressLine: { type: String, required: true },
  landmark: { type: String },
});

const orderSchema = new mongoose.Schema(
  {
    orderId: { type: String, unique: true }, // 🆕 Human-readable unique order ID
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    addressID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Address",
      required: true,
    },
    orderedItems: [orderedItemSchema],
    shippingAddress: shippingAddressSchema,
    paymentMethod: {
      type: String,
      enum: ["Razorpay", "COD", "Wallet"],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ["Pending", "Paid", "Failed", "Refunded"],
      default: "Pending",
    },
    totalPrice: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    finalAmount: { type: Number, required: true },
  },
  { timestamps: true }
);

//  Generate a unique readable order ID before saving
orderSchema.pre("save", async function (next) {
  if (!this.orderId) {
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    this.orderId = `ORD-${datePart}-${randomSuffix}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
