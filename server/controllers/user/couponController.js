import Coupon from "../../models/users/coupon.js";
import couponUsuage from "../../models/users/couponUsuage.js";
import Cart from "../../models/products/cart.js";
import Offer from "../../models/offer/offer.js";
export const applyCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    const { code, directTotal } = req.body;

    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code });
    if (!coupon)
      return res.status(404).json({ message: "Invalid coupon code" });

    // Validate coupon status
    if (!coupon.isActive)
      return res.status(400).json({ message: "Coupon is not active" });

    const today = new Date();
    if (!(today >= coupon.startDate && today <= coupon.endDate)) {
      return res
        .status(400)
        .json({ message: "Coupon expired or not valid today" });
    }

    // Usage limit validation
    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }

    const usedCoupon = await couponUsuage.findOne({
      couponId: coupon._id,
      userId,
    });

    if (usedCoupon && usedCoupon.count >= coupon.usagePerUser) {
      return res.status(400).json({
        message: "You have already used this coupon",
      });
    }

    // -------------------------------
    // FETCH CART ITEMS
    // -------------------------------
    const cartItems = await Cart.find({ userId })
      .populate({
        path: "productId",
        populate: [
          { path: "catgid", select: "catgName" },
          { path: "brandID", select: "brand_name" },
        ],
      })
      .populate("variantId")
      .lean();

    if (!cartItems.length) {
      return res.status(400).json({
        message: "Cart is empty — cannot apply coupon.",
      });
    }

    // -------------------------------
    // FETCH ACTIVE OFFERS
    // -------------------------------
    const activeCatOffers = await Offer.find({
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

    // -------------------------------
    // APPLY BEST OFFER TO EACH CART ITEM
    // -------------------------------
    let total = 0;

    for (const item of cartItems) {
      const size = item.variantId.size.find((s) => s.label === item.sizeLabel);
      const salePrice = size.salePrice;

      const catOffer = activeCatOffers.find(
        (off) =>
          off.categoryId.toString() === item.productId.catgid._id.toString()
      );

      const prodOffer = activeProductOffers.find((off) =>
        off.productIds.some(
          (id) => id.toString() === item.productId._id.toString()
        )
      );

      function computeDiscount(offer) {
        if (!offer) return 0;
        return offer.discountType === "percent"
          ? Math.floor((salePrice * offer.value) / 100)
          : offer.value;
      }

      const catDiscount = computeDiscount(catOffer);
      const prodDiscount = computeDiscount(prodOffer);

      let bestDiscount = Math.max(catDiscount, prodDiscount);

      const itemFinalPrice = Math.max(salePrice - bestDiscount, 1);

      total += itemFinalPrice * item.quantity;
    }

    // MIN PURCHASE CHECK after offers applied
    if (total < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum purchase value is ₹${coupon.minPurchase}`,
      });
    }

    // -------------------------------
    // APPLY COUPON NOW
    // -------------------------------
    let discount = 0;

    if (coupon.discountType === "percent") {
      discount = Math.floor((total * coupon.discountValue) / 100);
      if (coupon.maxDiscount) {
        discount = Math.min(discount, coupon.maxDiscount);
      }
    } else {
      discount = coupon.discountValue;
    }

    const finalTotal = Math.max(total - discount, 0);

    return res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      discount,
      total,
      finalTotal,
      couponDetails: coupon,
      couponCode: coupon.code,
    });
  } catch (err) {
    console.log("applyCoupon error:", err);
    return res.status(500).json({ message: "Internal server error" });
  }
};

//get all coupons
export const getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user._id;
    const coupons = await Coupon.find({ isActive: true }).lean();
    const userCoupon = await couponUsuage.find({ userId: userId }).lean();
    const displayCoupons = coupons.map((coup) => {
      const matching = userCoupon.find((c) => c.couponId === coup._id);
      return {
        ...coup,
        matching,
      };
    });
    res.status(200).json({ success: true, coupons: displayCoupons });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};
