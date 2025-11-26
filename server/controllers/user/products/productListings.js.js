import Product from "../../../models/products/Product.js";
import Variant from "../../../models/products/Variant.js";
import Offer from "../../../models/offer/offer.js";

export const productListings = async (req, res) => {
  try {
    const { productId } = req.params;
    // const BASE_URL = process.env.BASE_URL;

    const product = await Product.findById(productId)
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
    const activeOffers = await Offer.find({
      isActive: true,
      scope: "Category",
      categoryId: product.catgid._id,
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    const activeOffer = activeOffers[0] || null;

    const variantsWithOffer = variants.map((v) => {
      const sizes = v.size.map((s) => {
        let offerApplied = false;
        let finalPrice = s.salePrice;
        let offerAmount = 0;

        if (activeOffer) {
          offerApplied = true;

          if (activeOffer.discountType === "percent") {
            offerAmount = Math.floor((s.salePrice * activeOffer.value) / 100);
          } else {
            offerAmount = activeOffer.value;
          }

          finalPrice = Math.max(s.salePrice - offerAmount, 1);
        }

        return {
          ...s,
          offerApplied,
          offerType: activeOffer?.discountType || null,
          offerValue: activeOffer?.value || 0,
          offerAmount,
          finalPrice,
        };
      });

      return {
        ...v,
        images: (v.images || []).map((i) => `${i}`),
        size: sizes,
      };
    });

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

        let finalPrice = size.salePrice;
        let offerApplied = false;
        let offerAmount = 0;

        if (activeOffer) {
          offerApplied = true;

          if (activeOffer.discountType === "percent") {
            offerAmount = Math.floor(
              (size.salePrice * activeOffer.value) / 100
            );
          } else {
            offerAmount = activeOffer.value;
          }

          finalPrice = Math.max(size.salePrice - offerAmount, 1);
        }

        return {
          ...rp,
          image: variant.images?.[0] ? `${variant.images[0]}` : null,
          salePrice: size.salePrice,
          oldPrice: size.oldPrice,
          finalPrice,
          offerApplied,
          offerValue: activeOffer?.value || 0,
          offerType: activeOffer?.discountType || null,
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
