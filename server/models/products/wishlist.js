import mongoose from "mongoose";
const wishListSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },
    variantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Variant",
    },
    sizeLabel: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const Wishlist = mongoose.model("Wishlist", wishListSchema);
export default Wishlist;
