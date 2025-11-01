import Category from "../../models/products/category.js";

export const addCategory = async (req, res) => {
  try {
    const { catgName } = req.body;
    const existing = await Category.findOne({ catgName });
    if (existing)
      return res.status(400).json({ message: "Category already exists" });

    const newCat = new Category({ catgName, isActive: true });
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
export const editCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { catgName } = req.body;

    if (!catgName) {
      return res.status(400).json({
        success: false,
        message: "Category name is required",
      });
    }
    const updated = await Category.findByIdAndUpdate(
      id,
      { catgName: catgName },
      { new: true }
    );
    if (!updated) {
      return res
        .status(404)
        .json({ success: false, message: "Updation failed" });
    }
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, error: error.error });
  }
};
//softdelete
export const DeleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const cat = await Category.findByIdAndDelete(id);
    res.json({ message: "category deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete category" });
  }
};

export const ControlCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);
    if (!category) {
      return res.json({ success: false, message: "Cannot find category" });
    }
    category.isActive = !category.isActive;
    res.json({
      message: `category is ${category.isActive ? "Blocked" : "Unblocked"} `,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err });
  }
};
