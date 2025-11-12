import Product from "../../../models/products/Product.js";
import Variant from "../../../models/products/Variant.js";

export const productListings = async (req, res) => {
  try {
    const { productId } = req.params;
    // console.log(productId);
    const products = await Product.findById(productId)
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name")
      .lean();
    const variants = await Variant.find({ productId: productId }).lean();
    console.log(variants)
    const related = await Product.find({
      catgid: products.catgid._id,
      _id: { $ne: products._id },
    }).lean()
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name");
    const relatedProducts = await Promise.all(
      related.map(async (rel) => {
        const variant = await Variant.findOne({ productId: rel._id }).lean();
        // const size=variant.size[0]
        const image=variant.images[0]
        return {
          ...rel,
          salePrice: variant.salePrice,
          oldPrice: variant.oldPrice,
          image:image
        };
      })
    );
    res
      .status(200)
      .json({ success: true, products, variants, relatedProducts,});
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
