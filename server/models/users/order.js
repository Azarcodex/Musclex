import mongoose from "mongoose";
import crypto from "crypto";

const orderedItemSchema = new mongoose.Schema({
  productID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  variantID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Variant",
    required: true,
  },
  vendorID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    required: true,
  },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true },
  sizeLabel: { type: String, required: true },
  status: {
    type: String,
    required: true,
    enum: [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ],
    default: "Pending",
  },
  deliveredDate: {
    type: Date,
    default: null,
  },
  //return fields
  returnReason: {
    type: String,
    default: null,
  },
  vendorReason: {
    type: String,
    default: null,
  },
  returnDate: {
    type: Date,
    default: null,
  },
  refundAmount: {
    type: Number,
    default: 0,
  },
  returnStatus: {
    type: String,
    enum: ["Requested", "Approved", "Rejected", "Completed"],
    default: "Requested",
  },
  refundStatus: {
    type: String,
    enum: ["Not Initiated", "Pending", "Completed"],
    default: "Not Initiated",
  },
  vendorCreditStatus: {
    type: String,
    enum: ["NotCredited", "Credited", "Reversed"],
    default: "NotCredited",
  },
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
    // Human readable unique order ID
    orderId: { type: String, unique: true },

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

    // ORDER LEVEL STATUS
    orderStatus: {
      type: String,
      enum: [
        "Pending",
        "Confirmed",
        "Processing",
        "Shipped",
        "Out for Delivery",
        "Delivered",
        "Cancelled",
        "Returned",
      ],
      default: "Pending",
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
    expectedDelivery: { type: Date },
    deliveredDate: { type: Date },
    //coupon
    couponCode: {
      type: String,
      default: null,
    },

    discount: {
      type: Number,
      default: 0,
    },
    couponApplied: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Generate unique human readable orderId
orderSchema.pre("save", function (next) {
  if (!this.orderId) {
    const randomSuffix = crypto.randomBytes(3).toString("hex").toUpperCase();
    const datePart = new Date().toISOString().split("T")[0].replace(/-/g, "");
    this.orderId = `ORD-${datePart}-${randomSuffix}`;
  }
  next();
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
