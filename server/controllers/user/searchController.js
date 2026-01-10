import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";
import MESSAGES from "../../constants/messages.js";

export const SearchData = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query || query.trim() === "") {
      return res
        .status(400)
        .json({ success: false, message: MESSAGES.SEARCH_QUERY_REQUIRED });
    }
    const regex = new RegExp(query, "i");

    const products = await Product.aggregate([
      { $match: { isDeleted: false, isActive: true } },
      {
        $lookup: {
          from: "brands",
          localField: "brandID",
          foreignField: "_id",
          as: "brands",
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "catgid",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $unwind: { path: "$brands" },
      },
      {
        $unwind: { path: "$category" },
      },
      {
        $match: {
          $or: [
            { name: regex },
            { description: regex },
            { "brands.brand_name": regex },
            { "category.catgName": regex },
          ],
        },
      },
    ]);
    if (products.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: MESSAGES.NO_PRODUCTS_FOUND });
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
          count: products.length,
        };
      })
    );
    res
      .status(200)
      .json({ success: true, count: ProductList.length, results: ProductList });
  } catch (e) {
    res.status(500).json({ success: false, message: MESSAGES.SERVER_ERROR });
  }
};
