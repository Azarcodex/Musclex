import Product from "../../../models/products/Product.js";
import Variant from "../../../models/products/Variant.js";

export const getProducts = async (req, res) => {
  try {
    const URL = process.env.BASE_URL;
    const { category, brands, minPrice, maxPrice, rating, sortValue } =
      req.query;

    // Base queries
    const productQuery = { isDeleted: false, isActive: true };
    const variantQuery = { isListed: true };

    if (minPrice && maxPrice) {
      variantQuery["size.salePrice"] = {
        $gte: Number(minPrice),
        $lte: Number(maxPrice),
      };
    }

    const variants = await Variant.find(variantQuery).lean();

    // Map product IDs from variants
    const variantProductIds = variants.map((v) => v.productId.toString());
    const productIds = [...new Set(variantProductIds)];

    if (category) {
      const catArray = Array.isArray(category) ? category : category.split(",");
      productQuery.catgid = { $in: catArray };
    }
    if (brands) {
      const brandArray = Array.isArray(brands) ? brands : brands.split(",");
      productQuery.brandID = { $in: brandArray };
    }
    if (rating) {
      const ratingArray = Array.isArray(rating) ? rating : rating.split(",");
      productQuery.Avgrating = { $in: ratingArray };
    }

    const products = await Product.find(productQuery)
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name")
      .lean();

    const result = products
      .map((product) => {
        const relatedVariants = variants
          .filter((v) => v.productId.toString() === product._id.toString())
          .map((v) => ({
            ...v,
            images: (v.images || []).map((img) => `${URL}${img}`),

            sizes: v.size?.map((s) => ({
              ...s,
              salePrice: Number(s.salePrice),
              oldPrice: Number(s.oldPrice),
              discount: Math.floor(
                ((s.oldPrice - s.salePrice) / s.oldPrice) * 100
              ),
            })),
          }));

        const defaultVariant = relatedVariants[0];
        if (!defaultVariant) return null;

        const defaultSize = defaultVariant.sizes?.[0];
        if (!defaultSize) return null;

        return {
          ...product,
          brand: product.brandID?.brand_name,
          category: product.catgid?.catgName,
          prevImage: defaultVariant.images?.[0],
          discount: defaultSize.discount || 0,
          variants: defaultVariant,
          size: defaultSize,
        };
      })
      .filter(Boolean);

    switch (sortValue) {
      case "sortAZ":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "sortZA":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "sort01":
        result.sort((a, b) => {
          const aPrice = a.variants[0]?.sizes?.[0]?.salePrice || 0;
          const bPrice = b.variants[0]?.sizes?.[0]?.salePrice || 0;
          return aPrice - bPrice;
        });
        break;
      case "sort10":
        result.sort((a, b) => {
          const aPrice = a.variants[0]?.sizes?.[0]?.salePrice || 0;
          const bPrice = b.variants[0]?.sizes?.[0]?.salePrice || 0;
          return bPrice - aPrice;
        });
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    res.status(200).json({ success: true, result });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
