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
    const page = parseInt(req.query.page);
    const limit = 5;
    const skip = (page - 1) * limit;
    const vendor = req.vendor;
    // console.log(vendor);
    const products = await Product.find({ vendorID: vendor._id })
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalProduct = products.length;
    const totalPages = Math.ceil(totalProduct / limit);
    console.log(totalProduct);
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      data: products,
      totalPages: totalPages,
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching products",
    });
  }
};

//edit product
export const EditProducts = async (req, res) => {
  try {
    console.log(req.params);
    const { id } = req.params;
    // console.log(id);
    const { name, description, catgid, brandID } = req.body;
    // if (!name || !description || !catgid || !brandID) {
    //   return res.json({ message: "Fill all the fields" });
    // }
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name,
        description,
        catgid,
        brandID,
      },
      { new: true }
    )
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name");
    res.status(200).json({
      success: true,
      message: "updated successfully",
      update: updatedProduct,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const productVisibility = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    product.isDeleted = !product.isDeleted;
    await product.save();
    res.status(200).json({
      success: true,
      message: `${
        product.isDeleted
          ? "changed to invisible mode"
          : "Changed to visible mode"
      }`,
      product: product,
    });
  } catch (err) {
    res.status(500).json({ message: "Server down" });
  }
};

export const deleteProduct = async (req,res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    res
      .status(200)
      .json({ success: true, message: "product deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server down" });
  }
};
