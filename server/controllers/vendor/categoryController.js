import Category from "../../models/products/category.js";

export const addCategory = async (req, res) => {
  try {
    const { catgName } = req.body;
    const existing = await Category.findOne({ catgName });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const newCat = new Category({ catgName });
    await newCat.save();
    res.status(201).json({ message: "Category added", category: newCat });
  } catch (err) {
    res.status(500).json({ message: "Failed to add category" });
  }
};

// Get all categories
export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch categories" });
  }
};

//softdelete
export const DeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findByIdAndUpdate(
      id,
      { isActive: false },
      { new: true }
    );
    res.json({ message: "Category deactivated", category: cat });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category" });
  }
};
