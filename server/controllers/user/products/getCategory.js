import Category from "../../../models/products/category.js";

export const getCategories = async (req, res) => {
  try {
    const Categories = await Category.find({ isActive: true }).lean();
    res.status(200).json({ success: true, Categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.error });
  }
};
