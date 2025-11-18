import Brand from "../../models/products/brand.js";
import Category from "../../models/products/category.js";
import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";
import Vendor from "../../models/vendors/Vendor.js";
export const addProduct = async (req, res) => {
  try {
    const { name, description, catgid, brandID } = req.body;
    const vendorID = req.vendor.id;
    const vendor = await Vendor.findById(vendorID);
    if (!vendor.canAddProduct) {
      return res
        .status(401)
        .json({ message: "Admin have not allowed you to add Product" });
    }
    console.log(vendorID);
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
    const page = parseInt(req.query.page) || 1;
    const { query } = req.query;
    const limit = 6;
    const skip = (page - 1) * limit;
    const vendor = req.vendor;
    const search = query
      ? { $or: [{ name: { $regex: query, $options: "i" } }] }
      : {};
    const filter = {
      vendorID: vendor._id,
      ...search,
    };
    const products = await Product.find(filter)
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    const totalProduct = await Product.countDocuments({ vendorID: vendor._id });
    // console.log(totalProduct);
    const totalPages = Math.ceil(totalProduct / limit);
    //  console.log(totalPages)
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

export const deleteProduct = async (req, res) => {
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
//featured Product
export const FeaturedProducts = async (req, res) => {
  try {
    const featuredproduct = await Product.find({
      isDeleted: false,
      isFeatured: true,
    })
      .populate("brandID", "brand_name")
      .populate("catgid", "catgName")
      .lean();

    const result = await Promise.all(
      featuredproduct.map(async (product) => {
        const variant = await Variant.findOne({
          productId: product._id,
        }).lean();
        return {
          ...product,
          variant,
        };
      })
    );

    res.status(200).json({ success: true, product: result });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
};
