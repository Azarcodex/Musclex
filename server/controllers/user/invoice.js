import Order from "../../models/users/order.js";

export const getSingleOrder = async (req, res) => {
  try {
    const { orderId } = req.params;

    const order = await Order.findById(orderId)
      .populate({
        path: "orderedItems.productID",
        select: "name brandID",
        populate: { path: "brandID", select: "brand_name" },
      })
      .populate({
        path: "orderedItems.variantID",
        select: "flavour size images",
      })
      .populate({
        path: "addressID",
        select: "fullName phone addressLine city state pincode landmark",
      })
      .lean();

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, message: order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
