import Offer from "../../models/offer/offer.js";
import Cart from "../../models/products/cart.js";
import Address from "../../models/users/address.js";

export const getCheckoutData = async (req, res) => {
  try {
    const userId = req.user._id;

    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .lean();
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
    //available offers
    let today = new Date();
    const availableOffers = await Offer.find({
      isActive: true,
      scope: "Category",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();
    const checkOutItems = cartItems.map((item) => {
      const selectedSize = item?.variantId?.size.find(
        (s) => s.label === item.sizeLabel
      );
      let finalPrice = selectedSize?.salePrice;
      let offerApplied = false;
      let offerValue = 0;
      let offerType = "";
      let offerAmount = 0;
      const catOffer = availableOffers.find(
        (off) =>
          off.categoryId.toString() === item?.productId?.catgid?._id.toString()
      );
      if (catOffer) {
        offerApplied = true;
        offerType = catOffer.discountType;
        offerValue = catOffer.value;

        if (catOffer.discountType === "percent") {
          offerAmount = Math.floor((selectedSize.salePrice * offerValue) / 100);
        } else {
          offerAmount = offerValue;
        }

        finalPrice = Math.max(selectedSize.salePrice - offerAmount, 1);
      }
      return {
        ...item,
        offerApplied,
        offerType,
        offerValue,
        offerAmount,
        finalPrice,
      };
    });
    const total = checkOutItems.reduce(
      (sum, item) => sum + item.finalPrice * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      addresses,
      checkOutItems,
      total,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
