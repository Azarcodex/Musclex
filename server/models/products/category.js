import mongoose from "mongoose";
const categorySchema = new mongoose.Schema(
  {
    catgName: { type: String, required: true, unique: true, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const Category = mongoose.model("Category", categorySchema);
export default Category;
