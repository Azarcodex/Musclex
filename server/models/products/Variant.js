import mongoose from "mongoose";
const productVariantSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    color: { type: String },
    flavour: { type: String },
    images: [{ type: String }],
    reviewsCount: { type: Number, default: 0 },
    isOnOffer: { type: Boolean, default: false },
    isListed: { type: Boolean, default: true },
    size: [
      {
        label: {
          type: String,
        },
        sku: {
          type: String,
        },
        oldPrice: {
          type: Number,
          required: true,
          min: 0,
        },
        salePrice: {
          type: Number,
          required: true,
          min: 0,
        },
        stock: {
          type: Number,
          default: 0,
          min: 0,
        },
      },
    ],
  },
  { timestamps: true }
);
productVariantSchema.pre("save", function (next) {
  if (this.flavour && this.sizes?.length) {
    this.sizes = this.sizes.map((size) => {
      if (!size.sku) {
        const flavourCode = this.flavour.slice(0, 4).toUpperCase();
        const sizeCode = size.label.replace(/\s+/g, "").toUpperCase();
        size.sku = `${flavourCode}-${sizeCode}-${Date.now()
          .toString()
          .slice(-4)}`;
      }
      return size;
    });
  }
  next();
});
const Variant = mongoose.model("Variant", productVariantSchema);
export default Variant;
