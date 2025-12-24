import Product from "../../../models/products/Product.js";
import Variant from "../../../models/products/Variant.js";
import Offer from "../../../models/offer/offer.js";

export const productListings = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findOne({ _id: productId, isActive: true })
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name")
      .lean();

    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    const variants = await Variant.find({ productId }).lean();

    const today = new Date();

    // --------------------------
    // FETCH CATEGORY LEVEL OFFERS
    // --------------------------
    const categoryOffers = await Offer.find({
      isActive: true,
      scope: "Category",
      categoryId: product.catgid._id,
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    // --------------------------
    // FETCH PRODUCT LEVEL OFFERS
    // --------------------------
    const productOffers = await Offer.find({
      isActive: true,
      scope: "Product",
      productIds: { $in: [product._id] },
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    // --------------------------
    // APPLY BEST OFFER (CATEGORY vs PRODUCT)
    // --------------------------
    const pickBestOffer = (salePrice, catOffer, prodOffer) => {
      const computeDiscount = (offer) => {
        if (!offer) return 0;
        return offer.discountType === "percent"
          ? Math.floor((salePrice * offer.value) / 100)
          : offer.value;
      };

      const catDiscount = computeDiscount(catOffer);
      const prodDiscount = computeDiscount(prodOffer);

      if (catDiscount === 0 && prodDiscount === 0) return null;

      return catDiscount >= prodDiscount ? catOffer : prodOffer;
    };

    // --------------------------
    // APPLY OFFER TO ALL VARIANTS → ALL SIZES
    // --------------------------
    const variantsWithOffer = variants.map((variant) => {
      const updatedSizes = variant.size.map((s) => {
        const salePrice = s.salePrice;

        const bestOffer = pickBestOffer(
          salePrice,
          categoryOffers[0] || null,
          productOffers[0] || null
        );

        if (!bestOffer) {
          return {
            ...s,
            offerApplied: false,
            finalPrice: salePrice,
            offerType: null,
            offerValue: 0,
            offerAmount: 0,
          };
        }

        let offerAmount =
          bestOffer.discountType === "percent"
            ? Math.floor((salePrice * bestOffer.value) / 100)
            : bestOffer.value;

        const finalPrice = Math.max(salePrice - offerAmount, 1);

        return {
          ...s,
          offerApplied: true,
          offerType: bestOffer.discountType,
          offerValue: bestOffer.value,
          offerAmount,
          finalPrice,
        };
      });

      return {
        ...variant,
        images: (variant.images || []).map((i) => `${i}`),
        size: updatedSizes,
      };
    });

    // --------------------------
    // RELATED PRODUCTS (Same Category)
    // --------------------------
    const related = await Product.find({
      catgid: product.catgid._id,
      _id: { $ne: product._id },
    })
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name")
      .lean();

    const relatedProducts = await Promise.all(
      related.map(async (rp) => {
        const variant = await Variant.findOne({ productId: rp._id }).lean();
        if (!variant) return null;

        const size = variant.size?.[0];
        if (!size) return null;

        const bestOffer = pickBestOffer(
          size.salePrice,
          categoryOffers[0] || null,
          productOffers[0] || null
        );

        let finalPrice = size.salePrice;
        let offerAmount = 0;

        if (bestOffer) {
          offerAmount =
            bestOffer.discountType === "percent"
              ? Math.floor((size.salePrice * bestOffer.value) / 100)
              : bestOffer.value;

          finalPrice = Math.max(size.salePrice - offerAmount, 1);
        }

        return {
          ...rp,
          image: variant.images?.[0] || null,
          salePrice: size.salePrice,
          oldPrice: size.oldPrice,
          finalPrice,
          offerApplied: !!bestOffer,
          offerValue: bestOffer?.value || 0,
          offerType: bestOffer?.discountType || null,
          offerAmount,
        };
      })
    );

    res.status(200).json({
      success: true,
      product,
      variants: variantsWithOffer,
      relatedProducts: relatedProducts.filter(Boolean),
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
