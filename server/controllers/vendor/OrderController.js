import Order from "../../models/users/order.js";
export const getOrdersData = async (req, res) => {
  try {
    const vendor = req.vendor._id;
    const orders = await Order.find({ "orderedItems.vendorID": vendor })
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
//updating status (delivery)//didnt used in these code
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

//handling individual product status
const statusPriority = [
  "Pending",
  "Confirmed",
  "Processing",
  "Shipped",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
  "Returned",
];
const computeOrderStatus = (items) => {
  if (!items || items.length === 0) return "Pending";

  const statuses = items.map((item) => item.status);

  // If ALL items are Cancelled → order = Cancelled
  if (statuses.every((s) => s === "Cancelled")) {
    return "Cancelled";
  }

  //  If ALL items Delivered → order = Delivered
  if (statuses.every((s) => s === "Delivered")) {
    return "Delivered";
  }

  //  If returning
  if (statuses.some((s) => s === "Returned")) {
    const chances = statuses.every(
      (s) => s === "Returned" || s === "Delivered"
    );
    if (chances) {
      return "Returned";
    }
    return statuses.reduce((acc, s) => {
      return statusPriority.indexOf(s) < statusPriority.indexOf(acc) ? s : acc;
    }, statuses[0]);
  }

  return statuses.reduce((acc, s) => {
    return statusPriority.indexOf(s) < statusPriority.indexOf(acc) ? s : acc;
  }, statuses[0]);
};

export const statusProductWiseController = async (req, res) => {
  try {
    const { orderId, id } = req.params;
    const { status } = req.body;
    console.log(orderId, id, status);
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(400).json({ message: "Order not found" });
    }
    const product = order.orderedItems?.find(
      (item) => item._id.toString() === id.toString()
    );
    if (!product) {
      return res.status(400).json({ message: "product not found" });
    }
    if (product.status === "Cancelled") {
      return res.status(400).json({
        message: "Cannot update status. Item already cancelled.",
      });
    }
    if (product.status === "Returned") {
      return res.status(400).json({
        message: "Cannot update status. Item already returned by user.",
      });
    }
    product.status = status;
    if (status === "Delivered") {
      product.deliveredDate = new Date();
    }
    order.orderStatus = computeOrderStatus(order.orderedItems);

    await order.save();
    res.status(200).json({ message: "status updated successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error occurred" });
  }
};
