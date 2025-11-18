import Order from "../../models/users/order.js";
export const getOrdersData = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate({
        path: "orderedItems.productID",
        select: "name brandID catgid",
        populate: [
          { path: "catgid", select: "catgName" },
          { path: "brandID", select: "brand_name" },
        ],
      })
      .populate({
        path: "orderedItems.variantID",
        select: "flavour size images",
      })
      .populate({
        path: "addressID",
        select: "fullName phone city state pincode addressLine",
      })
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, message: orders });
  } catch (error) {
    console.log(error);
    res
      .status(500)
      .json({ success: false, message: "Internal server error occurred" });
  }
};
//updating status (delivery)
export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    console.log(id, status);
    const order = await Order.findByIdAndUpdate(
      id,
      { orderStatus: status },
      { new: true }
    );
    await order.save();
    res.status(200).json({ success: true, message: "Updated Successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error occurred" });
  }
};
