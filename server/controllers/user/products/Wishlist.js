import Offer from "../../../models/offer/offer.js";
import Wishlist from "../../../models/products/wishlist.js";

export const AddWishList = async (req, res) => {
  try {
    const { productId, variantId, sizeLabel } = req.body;
    // console.log(productId, variantId);
    const user = req.user;
    // const product = await Product.findById(productId);
    // const variant = await Variant.findById(variantId);
    const userId = user._id;
    const wishListItems = await Wishlist.findOne({
      userId: userId,
      productId: productId,
      variantId: variantId,
      sizeLabel: sizeLabel,
    });

    if (wishListItems) {
      return res
        .status(400)
        .json({ message: "Item already exist in WishList" });
    }
    const wishList = await Wishlist.create({
      productId: productId,
      userId: userId,
      variantId: variantId,
      sizeLabel: sizeLabel,
    });

    res
      .status(200)
      .json({ success: true, message: "liked successfully", wishList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to Add Product" });
  }
};
export const removeWishList = async (req, res) => {
  try {
    const { id } = req.params;
    const wishList = await Wishlist.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "item removed from wishList" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//getWishlist
export const getWishList = async (req, res) => {
  try {
    const userId = req.user._id;

    const today = new Date();

    const activeCategoryOffers = await Offer.find({
      isActive: true,
      scope: "Category",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    const activeProductOffers = await Offer.find({
      isActive: true,
      scope: "Product",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    const wishList = await Wishlist.find({ userId })
      .populate({
        path: "productId",
        populate: [
          { path: "catgid", select: "catgName" },
          { path: "brandID", select: "brand_name" },
        ],
      })
      .populate("variantId")
      .lean();

    wishList.forEach((item) => {
      const sizes = item.variantId.size;

      item.variantId.size = sizes.map((s) => {
        const salePrice = s.salePrice;

        // CATEGORY & PRODUCT OFFER CHECK
        const catOffer = activeCategoryOffers.find(
          (off) =>
            off.categoryId.toString() === item.productId.catgid._id.toString()
        );

        const prodOffer = activeProductOffers.find((off) =>
          off.productIds.some(
            (id) => id.toString() === item.productId._id.toString()
          )
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

        if (catDiscount >= prodDiscount && catDiscount > 0) {
          bestOffer = catOffer;
          bestDiscount = catDiscount;
        } else if (prodDiscount > 0) {
          bestOffer = prodOffer;
          bestDiscount = prodDiscount;
        }

        return {
          ...s,
          offerApplied: !!bestOffer,
          offerType: bestOffer?.discountType || null,
          offerValue: bestOffer?.value || 0,
          offerAmount: bestDiscount,
          finalPrice: Math.max(salePrice - bestDiscount, 1),
        };
      });
    });

    res.status(200).json({ success: true, wishList });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "server down" });
  }
};
