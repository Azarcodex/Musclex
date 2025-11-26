import Coupon from "../../models/users/coupon.js";
export const createCoupon = async (req, res) => {
  try {
    const {
      code,
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit,
      perUserLimit,
    } = req.body;

    // check duplicate code
    const exists = await Coupon.findOne({ code: code.toUpperCase() });
    if (exists) {
      return res.status(400).json({ message: "Coupon code already exists" });
    }

    const coupon = new Coupon({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      minPurchase,
      maxDiscount,
      startDate,
      endDate,
      usageLimit: usageLimit || null,
      perUserLimit: perUserLimit || null,
    });

    await coupon.save();

    res.status(201).json({ message: "Coupon created successfully", coupon });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });

    res.status(200).json({ coupons });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const updateData = req.body;

    const coupon = await Coupon.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    return res.status(200).json({
      success: true,
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.log("Update Coupon Error:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const toggleCouponStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res
        .status(404)
        .json({ success: false, message: "Coupon not found" });
    }

    coupon.isActive = !coupon.isActive;
    await coupon.save();

    res.status(200).json({
      success: true,
      message: `Coupon ${
        coupon.isActive ? "activated" : "deactivated"
      } successfully`,
      coupon,
    });
  } catch (error) {
    console.log("Toggle Coupon Error:", error);

    res.status(500).json({ success: false, message: "Server Error" });
  }
};
