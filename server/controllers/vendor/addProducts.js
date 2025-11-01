import Brand from "../../models/products/brand.js";
import Category from "../../models/products/category.js";
import Product from "../../models/products/Product.js";

export const addProduct = async (req, res) => {
  try {
    const { name, description, catgid, brandID } = req.body;
    const vendorID = req.vendor.id;
    console.log(vendorID);
    console.log("---------------");
    console.log(req.vendor);
    if (!name || !catgid || !brandID) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }
    const categoryExist = await Category.findById(catgid);
    const brandExists = await Brand.findById(brandID);
    if (!categoryExist || !brandExists) {
      return res.status(400).json({ message: "Invalid category or brand ID" });
    }
    const newProduct = new Product({
      name,
      description,
      catgid,
      brandID,
      vendorID,
    });
    await newProduct.save();
    return res.status(201).json({
      success: true,
      message: "Product added successfully",
      newProduct,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server error" });
  }
};

export const getProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};
