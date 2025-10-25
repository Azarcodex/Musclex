import mongoose from "mongoose";
const vendorSchema = new mongoose.Schema(
  {
    shopName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    place: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default:"pending",
      lowercase:true
    },
    canAddProduct: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Vendor = mongoose.model("Vendor", vendorSchema);
export default Vendor;
