import mongoose from "mongoose";

const offerSchema = new mongoose.Schema(
  {
    createdBy: {
      type: String,
      enum: ["Admin", "Vendor"],
      required: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "createdBy",
    },

    scope: {
      type: String,
      enum: ["Category", "Product"],
      required: true,
    },

    // Scope: Category
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },

    // Scope: Product
    productIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
      },
    ],

    discountType: {
      type: String,
      enum: ["percent", "flat"],
      required: true,
    },

    value: {
      type: Number,
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Offer=mongoose.model("Offer", offerSchema);
export default Offer
