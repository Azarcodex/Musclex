import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";

export const SearchData = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: "Search query is required" });
    }
    const regex = new RegExp(query, "i");
    const products = await Product.find({
      isDeleted: false,
      $or: [
        { name: regex },
        { description: regex },
        { "brandID.brand_name": regex },
        { "catgid.catgName": regex },
      ],
    })
      .populate("brandID", "brand_name")
      .populate("catgid", "catgName");

    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "No products found" });
    }
    const ProductList = await Promise.all(
      products.map(async (product) => {
        const variant = await Variant.findOne({ productId: product._id })
          .sort({ createdAt: -1 })
          .lean();
        return {
          ...product,
          variant,
          image: variant?.images?.[0],
        };
      })
    );
  } catch (e) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
