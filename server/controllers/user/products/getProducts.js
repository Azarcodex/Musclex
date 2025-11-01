import Product from "../../../models/products/Product.js";
import Variant from "../../../models/products/Variant.js";

export const getProducts = async (req, res) => {
  try {
    const {
      categories,
      brands,
      minPrice,
      maxPrice,
      rating,
      sortMode,
      discountfav,
    } = req.query;

    // Base URL for image linking
    const baseURL = process.env.BASE_URL || "http://localhost:5000";

    // STEP 1️⃣ → Build variant filter
    const variantQuery = { isListed: true };

    if (minPrice && maxPrice) {
      variantQuery.salePrice = {
        $gte: Number(minPrice),
        $lte: Number(maxPrice),
      };
    }

    let discountApplied = false;
    if (discountfav && !isNaN(discountfav) && Number(discountfav) > 0) {
      discountApplied = true;
      variantQuery.discount = { $gte: Number(discountfav) };
    }

    // STEP 2️⃣ → Fetch variants
    const variants = await Variant.find(variantQuery).lean();

    // STEP 3️⃣ → Extract product IDs from variants
    const productIds = [
      ...new Set(variants.map((v) => v.productId.toString())),
    ];

    // STEP 4️⃣ → Build product filter
    const productQuery = { isDeleted: false, status: "Active" };

    if (discountApplied && productIds.length > 0) {
      productQuery._id = { $in: productIds };
    }

    if (categories) {
      const catArray = Array.isArray(categories)
        ? categories
        : categories.split(",");
      productQuery.catgid = { $in: catArray };
    }

    if (brands) {
      const brandArray = Array.isArray(brands) ? brands : brands.split(",");
      productQuery.brandID = { $in: brandArray };
    }

    if (rating) {
      const rateArray = Array.isArray(rating) ? rating : rating.split(",");
      productQuery.Avgrating = { $in: rateArray };
    }

    // STEP 5️⃣ → Fetch products with populated brand & category
    const products = await Product.find(productQuery)
      .populate("brandID", "brand_name")
      .populate("catgid", "catgName")
      .lean();

    // STEP 6️⃣ → Merge products with their variants
    const result = products
      .map((product) => {
        const productVariants = variants
          .filter((v) => v.productId.toString() === product._id.toString())
          .map((v) => ({
            ...v,
            images: (v.images || []).map(
              (img) => `http://localhost:3000${img}`
            ),
          }));

        // Pick default variant (first one)
        const defaultVariant = productVariants[0];

        if (!defaultVariant) return null;

        // Determine sale price
        const salePrice = defaultVariant.salePrice || 0;

        // Pick first image or placeholder
        const prevImage = defaultVariant.images?.[0] || `${baseURL}/place.png`;

        // Calculate discount if not already in variant
        const discount = defaultVariant.oldPrice
          ? Math.round(
              ((defaultVariant.oldPrice - defaultVariant.salePrice) /
                defaultVariant.oldPrice) *
                100
            )
          : 0;

        return {
          ...product,
          brand: product.brandID?.brand_name || "Unknown Brand",
          category: product.catgid?.catgName || "Unknown Category",
          prevImage,
          salePrice,
          discount,
          variants: productVariants,
        };
      })
      .filter(Boolean); // remove nulls (products without variants)

    // STEP 7️⃣ → Sorting
    switch (sortMode) {
      case "sortAZ":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "sortZA":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "sort01": // price low → high
        result.sort((a, b) => (a.salePrice || 0) - (b.salePrice || 0));
        break;
      case "sort10": // price high → low
        result.sort((a, b) => (b.salePrice || 0) - (a.salePrice || 0));
        break;
      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // STEP 8️⃣ → Send response
    res.status(200).json({ success: true, result });
  } catch (err) {
    console.error("❌ getProducts error:", err);
    res.status(500).json({
      success: false,
      message: "Cannot load products",
      error: err.message,
    });
  }
};
