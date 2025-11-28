import Coupon from "../../models/users/coupon.js";
import couponUsuage from "../../models/users/couponUsuage.js";

export const applyCoupon = async (req, res) => {
  try {
    const userId = req.user._id;
    console.log(req.body);
    const { code, directTotal } = req.body;
    if (!code) {
      return res.status(400).json({ message: "Coupon code is required" });
    }

    const coupon = await Coupon.findOne({ code });
    const usedCoupon = await couponUsuage.findOne({
      couponId: coupon._id,
      userId: userId,
    });
    if (!coupon) {
      return res.status(404).json({ message: "Invalid coupon code" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon is not active" });
    }

    const today = new Date();
    if (!(today >= coupon.startDate && today <= coupon.endDate)) {
      return res
        .status(400)
        .json({ message: "Coupon is expired or not valid today" });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(400).json({ message: "Coupon usage limit reached" });
    }
    if (usedCoupon) {
      if (usedCoupon.count > coupon.usagePerUser) {
        return res.status(400).json({
          message: "You have already applied these coupon.No more Limit!",
        });
      }
    }

    let total = 0;

    if (directTotal && Number(directTotal) > 0) {
      total = Number(directTotal);
    } else {
      const cartItems = await Cart.find({ userId }).lean();
      if (!cartItems.length) {
        return res.status(400).json({
          message: "No items found — add items to cart or pass directTotal",
        });
      }

      total = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );
    }

    // Minimum purchase check
    if (total < coupon.minPurchase) {
      return res.status(400).json({
        message: `Minimum order value is ₹${coupon.minPurchase}`,
      });
    }

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
