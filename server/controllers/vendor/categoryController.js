import Category from "../../models/products/category.js";

export const getCategoryVendor = async (req, res) => {
  try {
    const category = await Category.find({ isActive: true });
    res.status(200).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
