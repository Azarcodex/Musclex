import mongoose from "mongoose";
const brandSchema = new mongoose.Schema(
  {
    brand_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Brand = mongoose.model("Brand", brandSchema);
export default Brand;
