import Product from "../../models/products/Product.js";
import Vendor from "../../models/vendors/Vendor.js";
import Category from "../../models/products/category.js";
import Brand from "../../models/products/brand.js";
export const getVendorProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const totalVendors = await Vendor.countDocuments();
    const { search } = req.query;
    const query = search
      ? {
          $or: [
            { shopName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const vendors = await Vendor.aggregate([
      {
        $match: query,
      },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "vendorID",
          as: "products",
        },
      },
      {
        $addFields: {
          totalProducts: { $size: { $ifNull: ["$products", []] } },
        },
      },
      {
        $project: {
          shopName: 1,
          email: 1,
          totalProducts: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    const totalPages = Math.ceil(totalVendors / limit);
    res.status(200).json({
      success: true,
      vendors,
      pagination: {
        totalProducts: totalVendors,
        current: page,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};

export const fetchVendorProducts = async (req, res) => {
  try {
    const { vendorId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.query || "";
    const limit = 2;
    const skip = (page - 1) * limit;

    // Validate vendor
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    // Base product query
    const productQuery = {
      vendorID: vendorId,
    };

    // SEARCH LOGIC
    if (search) {
      // Find matching categories
      const categories = await Category.find({
        catgName: { $regex: search, $options: "i" },
      }).select("_id");

      // Find matching brands
      const brands = await Brand.find({
        brand_name: { $regex: search, $options: "i" },
      }).select("_id");

      const categoryIds = categories.map((c) => c._id);
      const brandIds = brands.map((b) => b._id);

      productQuery.$or = [
        { name: { $regex: search, $options: "i" } }, // product name
        { catgid: { $in: categoryIds } }, // category
        { brandID: { $in: brandIds } }, // brand
      ];
    }

    // Fetch products
    const products = await Product.find(productQuery)
      .populate("brandID", "brand_name")
      .populate("catgid", "catgName")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Count with same query
    const totalProducts = await Product.countDocuments(productQuery);
    const totalPages = Math.ceil(totalProducts / limit);

    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      products,
      pagination: {
        totalProducts,
        totalPages,
        currentPage: page,
        limit,
      },
    });
  } catch (err) {
    console.error("fetchVendorProducts error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
  }
};
