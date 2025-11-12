import Category from "../../models/products/category.js";
import Product from "../../models/products/Product.js";

export const categoryViewController = async (req, res) => {
  try {
    const { id } = req.params;
    // console.log(id);
    const category = await Category.findById(id);
    category.isActive = !category.isActive;
    await category.save();
    res.status(200).json({
      success: true,
      message: `${
        category.isActive
          ? "catgeory is been activated"
          : "category Deactivated"
      }`,
    });
  } catch (err) {
    // console.log(err)
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const getAllCategoryAdmin = async (req, res) => {
  try {
    const category = await Category.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "catgid",
          as: "products",
        },
      },
      { $addFields: { totalCount: { $size: { $ifNull: ["$products", []] } } } },
      { $project: { catgName: 1, createdAt: 1, totalCount: 1,isActive:1 } },
    ]);
    res.status(200).json({ category });
  } catch (error) {
    res.status(500).json({ message: "server error " });
  }
};
