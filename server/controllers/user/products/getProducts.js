import Offer from "../../../models/offer/offer.js";
import Product from "../../../models/products/Product.js";
import Variant from "../../../models/products/Variant.js";
import Category from "../../../models/products/category.js";

export const getProducts = async (req, res) => {
  try {
    const URL = process.env.BASE_URL;

    const {
      page = 1,
      category,
      brands,
      minPrice,
      maxPrice,
      rating,
      sortValue,
    } = req.query;

    const limit = 4;
    const skip = (page - 1) * limit;

    // ---------------- BASE QUERIES ----------------
    const productQuery = { isDeleted: false, isActive: true };
    const variantQuery = { isListed: true };

    if (minPrice || maxPrice) {
      variantQuery["size.salePrice"] = {};
      if (minPrice) variantQuery["size.salePrice"].$gte = Number(minPrice);
      if (maxPrice) variantQuery["size.salePrice"].$lte = Number(maxPrice);
    }

    if (category) {
      productQuery.catgid = { $in: category.split(",") };
    }

    if (brands) {
      productQuery.brandID = { $in: brands.split(",") };
    }

    if (rating) {
      productQuery.Avgrating = { $in: rating.split(",") };
    }

    // ---------------- FETCH DATA (NO PAGINATION HERE) ----------------
    const [products, variants] = await Promise.all([
      Product.find(productQuery)
        .populate("catgid", "catgName")
        .populate("brandID", "brand_name")
        .lean(),

      Variant.find(variantQuery).lean(),
    ]);

    // Active category offers
    const today = new Date();
    const activeOffers = await Offer.find({
      isActive: true,
      scope: "Category",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    // Active product offers
    const activeProductOffers = await Offer.find({
      isActive: true,
      scope: "Product",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    // ---------------- FILTER PRODUCTS BY VARIANTS ----------------
    let result = products
      .map((product) => {
        const relatedVariants = variants
          .filter((v) => v.productId.toString() === product._id.toString())
          .map((v) => {
            // const filteredSizes = v.size?.filter((s) => {
            //   if (minPrice && maxPrice) {
            //     return s.salePrice >= minPrice && s.salePrice <= maxPrice;
            //   }
            //   if (minPrice) return s.salePrice >= minPrice;
            //   if (maxPrice) return s.salePrice <= maxPrice;
            //   return true;
            // });

            const filteredSizes = v.size?.filter((s) => {
              let effectivePrice = s.salePrice;

              // category offer
              const catOffer = activeOffers.find(
                (off) =>
                  off.categoryId?.toString() === product.catgid._id.toString()
              );

              // product offer
              const prodOffer = activeProductOffers.find((off) =>
                off.productIds.some(
                  (id) => id.toString() === product._id.toString()
                )
              );

              const computeDiscount = (offer) => {
                if (!offer) return 0;
                return offer.discountType === "percent"
                  ? Math.floor((effectivePrice * offer.value) / 100)
                  : offer.value;
              };

              const catDiscount = computeDiscount(catOffer);
              const prodDiscount = computeDiscount(prodOffer);
              const bestDiscount = Math.max(catDiscount, prodDiscount);

              effectivePrice = Math.max(effectivePrice - bestDiscount, 1);

              if (minPrice && maxPrice) {
                return effectivePrice >= minPrice && effectivePrice <= maxPrice;
              }
              if (minPrice) return effectivePrice >= minPrice;
              if (maxPrice) return effectivePrice <= maxPrice;
              return true;
            });
            //end of offer logic
            if (!filteredSizes?.length) return null;

            return {
              ...v,
              images: (v.images || []).map((img) => `${URL}${img}`),
              sizes: filteredSizes,
            };
          })
          .filter(Boolean);

        if (!relatedVariants.length) return null;

        const defaultVariant = relatedVariants[0];
        const defaultSize = defaultVariant.sizes[0];
        if (!defaultSize) return null;

        return {
          ...product,
          relatedVariants,
          brand: product.brandID?.brand_name,
          category: product.catgid?.catgName,
          prevImage: defaultVariant.images?.[0],
          variants: defaultVariant,
          size: defaultSize,
        };
      })
      .filter(Boolean);

    // ---------------- OFFER APPLICATION ----------------
    result.forEach((product) => {
      const salePrice = product?.size?.salePrice;
      if (!salePrice) return;

      const catOffer = activeOffers.find(
        (off) => off.categoryId?.toString() === product.catgid._id.toString()
      );

      const prodOffer = activeProductOffers.find((off) =>
        off.productIds.some((id) => id.toString() === product._id.toString())
      );

      const computeDiscount = (offer) => {
        if (!offer) return 0;
        return offer.discountType === "percent"
          ? Math.floor((salePrice * offer.value) / 100)
          : offer.value;
      };

      const catDiscount = computeDiscount(catOffer);
      const prodDiscount = computeDiscount(prodOffer);

      let bestOffer = null;
      let bestDiscount = 0;

      if (catDiscount > prodDiscount) {
        bestOffer = catOffer;
        bestDiscount = catDiscount;
      } else if (prodDiscount > 0) {
        bestOffer = prodOffer;
        bestDiscount = prodDiscount;
      }

      if (!bestOffer) return;

      const finalPrice = Math.max(salePrice - bestDiscount, 1);

      product.size.offerApplied = true;
      product.size.offerType = bestOffer.discountType;
      product.size.offerValue = bestOffer.value;
      product.size.offerPrice = bestDiscount;
      product.size.finalPrice = finalPrice;
    });

    // ---------------- SORTING ----------------
    switch (sortValue) {
      case "sortAZ":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;

      case "sortZA":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;

      case "sort01":
        result.sort((a, b) => a.size.salePrice - b.size.salePrice);
        break;

      case "sort10":
        result.sort((a, b) => b.size.salePrice - a.size.salePrice);
        break;

      default:
        result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // ---------------- PAGINATION (FINAL STEP) ----------------
    const totalProducts = result.length;
    const totalPages = Math.ceil(totalProducts / limit);

    const paginatedResult = result.slice(skip, skip + limit);

    // ---------------- ACTIVE CATEGORIES ----------------
    const activeCategories = await Category.find(
      { isActive: true },
      { _id: 1, name: 1 }
    );

    res.status(200).json({
      success: true,
      result: paginatedResult,
      activeCategories: activeCategories.map((c) => ({
        id: c._id,
        name: c.name,
      })),
      pagination: {
        totalProducts,
        totalPages,
        currentPage: Number(page),
      },
    });
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
