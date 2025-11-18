import mongoose from "mongoose";
const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String },
    Avgrating: { type: Number, default: 0, min: 0, max: 5 },
    catgid: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    isFeatured: { type: Boolean, default: false },
    brandID: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    vendorID: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor" },
    isDeleted: { type: Boolean, default: false },
    totalReviews: { type: Number, default: 0 },
    isActive:{type:Boolean,default:true},
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  },
  { timestamps: true }
);
const Product = mongoose.model("Product", productSchema);
export default Product;
