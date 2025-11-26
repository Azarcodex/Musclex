import Offer from "../../../models/offer/offer.js";
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

    //category offer setup
    const today = new Date();
    const activeOffers = await Offer.find({
      isActive: true,
      scope: "Category",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();
    //product offerSetUp
    const activeProductOffers = await Offer.find({
      isActive: true,
      scope: "Product",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    // console.log("✅✅=>"+activeProductOffers);
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
          relatedVariants,
          brand: product.brandID?.brand_name,
          category: product.catgid?.catgName,
          prevImage: defaultVariant.images?.[0],
          discount: defaultSize.discount || 0,
          variants: defaultVariant,
          size: defaultSize,
        };
      })
      .filter(Boolean);
    //offer
    result.forEach((product) => {
      const salePrice = product?.size?.salePrice;
      if (!salePrice) return;

      // ---- CATEGORY OFFER ----
      const catOffer = activeOffers.find(
        (off) => off.categoryId?.toString() === product.catgid._id.toString()
      );

      // ---- PRODUCT OFFER ----
      const prodOffer = activeProductOffers.find((off) =>
        off.productIds.some((id) => id.toString() === product._id.toString())
      );

      // Compute discount amount
      const computeDiscount = (offer) => {
        if (!offer) return 0;
        return offer.discountType === "percent"
          ? Math.floor((salePrice * offer.value) / 100)
          : offer.value;
      };

      const catDiscount = computeDiscount(catOffer);
      const prodDiscount = computeDiscount(prodOffer);

      // Decide best offer (max discount)
      let bestOffer = null;
      let bestDiscount = 0;

      if (catDiscount > prodDiscount) {
        bestOffer = catOffer;
        bestDiscount = catDiscount;
      } else if (prodDiscount > 0) {
        bestOffer = prodOffer;
        bestDiscount = prodDiscount;
      }

      // If no offer → nothing to apply
      if (!bestOffer) return;

      // Apply best offer
      const finalPrice = Math.max(salePrice - bestDiscount, 1);

      product.size.offerApplied = true;
      product.size.offerType = bestOffer.discountType;
      product.size.offerValue = bestOffer.value;
      product.size.offerPrice = bestDiscount;
      product.size.finalPrice = finalPrice;

      // Optional: keep salePrice/original untouched
    });

    // result.forEach((product) => {
    //   const offer = activeOffers?.find(
    //     (off) => off.categoryId.toString() === product.catgid._id.toString()
    //   );

    //   if (!offer) {
    //     return;
    //   }
    //   let offerPrice = 0;
    //   const salePrice = product?.size?.salePrice;
    //   if (offer.discountType === "percent") {
    //     offerPrice = Math.floor((salePrice * offer.value) / 100);
    //   } else {
    //     offerPrice = offer.value;
    //   }
    //   const finalPrice = Math.max(salePrice - offerPrice, 1);
    //   product.size.offerApplied = true;
    //   product.size.offerType = offer.discountType;
    //   product.size.offerValue = offer.value;
    //   product.size.offerPrice = offerPrice;
    //   product.size.finalPrice = finalPrice;
    // });

    //applying to each product for category
    // result.forEach((product) => {
    //   const offer = activeOffers?.find(
    //     (off) => off.categoryId.toString() === product.catgid._id.toString()
    //   );
    //   console.log(offer)
    //   if (!offer) return;
    //   product?.relatedVariants?.forEach((variant) => {
    //     variant.size = variant?.size?.map((size) => {
    //       const salePrice = size.salePrice;
    //       let offerAmount = 0;
    //       if (offer.discountType === "percent") {
    //         offerAmount = Math.floor((salePrice * offer.value) / 100);
    //       } else {
    //         offerAmount = offer.value;
    //       }
    //       const finalPrice = Math.max(salePrice - offerAmount, 1);
    //       return {
    //         ...size,
    //         offerApplied: true,
    //         offerType: offer.discountType,
    //         offerValue: offer.value,
    //         offerAmount,
    //         finalPrice,
    //       };
    //     });
    //   });
    // });
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
