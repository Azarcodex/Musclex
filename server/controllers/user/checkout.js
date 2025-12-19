import Offer from "../../models/offer/offer.js";
import Cart from "../../models/products/cart.js";
import Address from "../../models/users/address.js";

export const getCheckoutData = async (req, res) => {
  try {
    const userId = req.user._id;

    // Fetch addresses
    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .lean();

    // Fetch cart items
    const cartItems = await Cart.find({ userId })
      .populate({
        path: "productId",
        select: "name brandID Avgrating catgid images vendorID",
        populate: [
          { path: "brandID", select: "brand_name" },
          { path: "catgid", select: "catgName" },
        ],
      })
      .populate("variantId", "flavour images size")
      .lean();

    // Fetch Active Offers
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

    // ---------- APPLY “BEST OFFER” LOGIC ----------
    const checkOutItems = cartItems
      .map((item) => {
        const sizeObj = item.variantId?.size?.find(
          (s) => s.label === item.sizeLabel
        );
        if (!sizeObj) return null;

        const salePrice = Number(sizeObj.salePrice);

        // CATEGORY OFFER
        const categoryOffer = activeCategoryOffers.find(
          (off) =>
            off.categoryId?.toString() === item.productId.catgid?._id.toString()
        );

        // PRODUCT OFFER
        const productOffer = activeProductOffers.find((off) =>
          off.productIds.some(
            (pid) => pid.toString() === item.productId._id.toString()
          )
        );

        // COMPUTE DISCOUNT
        const computeDiscount = (offer) => {
          if (!offer) return 0;
          if (offer.discountType === "percent") {
            return Math.floor((salePrice * offer.value) / 100);
          } else {
            return offer.value;
          }
        };

        const catDiscount = computeDiscount(categoryOffer);
        const prodDiscount = computeDiscount(productOffer);

        let bestOffer = null;
        let bestDiscount = 0;

        if (catDiscount > prodDiscount) {
          bestOffer = categoryOffer;
          bestDiscount = catDiscount;
        } else if (prodDiscount > 0) {
          bestOffer = productOffer;
          bestDiscount = prodDiscount;
        }

        // FINAL PRICE
        const finalPrice = bestOffer
          ? Math.max(salePrice - bestDiscount, 1)
          : salePrice;

        return {
          ...item,
          offerApplied: !!bestOffer,
          offerType: bestOffer?.discountType || null,
          offerValue: bestOffer?.value || 0,
          offerAmount: bestDiscount,
          finalPrice,
        };
      })
      .filter(Boolean);

    // CART TOTAL
    const total = checkOutItems.reduce(
      (sum, i) => sum + i.finalPrice * i.quantity,
      0
    );
    console.log(total);
    const ORDER_LIMIT = 1000;

    const canPlaceOrder = total <= ORDER_LIMIT;

    return res.status(200).json({
      success: true,
      addresses,
      checkOutItems,
      total,
      ORDER_LIMIT,
      canPlaceOrder,
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
