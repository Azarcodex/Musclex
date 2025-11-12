import Cart from "../../models/products/cart.js";
import Address from "../../models/users/address.js";

export const getCheckoutData = async (req, res) => {
  try {
    const userId = req.user._id;

    const addresses = await Address.find({ userId })
      .sort({ isDefault: -1, updatedAt: -1 })
      .lean();
    const cartItems = await Cart.find({ userId })
      .populate("productId", "name images")
      .populate("variantId", "flavour images");

    const total = cartItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    res.status(200).json({
      success: true,
      addresses,
      cartItems,
      total,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
