import mongoose from "mongoose";
const productVariantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    color: { type: String },
    stock: { type: Number, default: 0, min: 0 },
    oldPrice: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 },
    salePrice: { type: Number, min: 0 },
    size: { type: String },
    flavour: { type: String },
    images: [{ type: String }],
    reviewsCount: { type: Number, default: 0 },
    isOnOffer: { type: Boolean, default: false },
    isListed: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Variant = mongoose.model("Variant", productVariantSchema);
export default Variant
