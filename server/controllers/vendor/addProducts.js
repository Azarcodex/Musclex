import Brand from "../../models/products/brand.js";
import Category from "../../models/products/category.js";
import Product from "../../models/products/Product.js";

export const addProduct = async (req, res) => {
  try {
    const { name, description, discount, catgid, brandID,Avgrating } = req.body;
    // const vendorID = req.user.id;
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
      discount,
      catgid,
      brandID,
      Avgrating
      // vendorID,
    });
    await newProduct.save();
    return res
      .status(201)
      .json({ success: true, message: "Product added successfully",newProduct });
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Server error" });
  }
};
