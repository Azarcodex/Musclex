import Product from "../../../models/products/Product.js";
import Variant from "../../../models/products/Variant.js";

export const getProducts = async (req, res) => {
  try {
    const { categories, brands, minPrice, maxPrice, rating, sortMode } =
      req.query;
    const target = { isDeleted: false, status: "Active" };
    console.log(rating);
    if (categories && categories.length > 0) {
      const category = Array.isArray(categories)
        ? categories
        : categories.split(",");
      target.catgid = { $in: category };
    }
    if (brands && brands.length > 0) {
      const brand = Array.isArray(brands) ? brands : brands.split(",");
      target.brandID = { $in: brand };
    }
    if (rating && rating.length > 0) {
      const rate = Array.isArray(rating) ? rating : rating.split(",");
      target.Avgrating = { $in: rate };
    }
    const products = await Product.find(target)
      .populate("brandID", "brand_name")
      .lean()
      .populate("catgid", "catgName");
    const productIds = products.map((product) => product._id);
    const variantQuery = { productId: { $in: productIds }, isListed: true };
    if (minPrice && maxPrice) {
      variantQuery.salePrice = { $gte: minPrice, $lte: maxPrice };
    }
    const variants = await Variant.find(variantQuery).lean();
    const result = products.map((product) => {
      const productVariants = variants.filter(
        (v) => v.productId.toString() === product._id.toString()
      );
      let defaultVariant = productVariants[0];
      let salePrice = defaultVariant ? defaultVariant.salePrice : null;
      const images = productVariants.flatMap((p) => p.images);
      const prevImage = images.length > 0 ? images[0] : "/place.png";
      return {
        ...product,
        prevImage,
        salePrice,
        variants: productVariants,
      };
    });
    switch (sortMode) {
      case "sortAZ":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "sortZA":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "sort01":
        result.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case "sort10":
        result.sort((a, b) => b.salePrice - a.salePrice);
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "cannot load products" });
  }
};
