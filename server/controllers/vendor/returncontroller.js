import Order from "../../models/users/order.js";
import Variant from "../../models/products/Variant.js";
export const updateReturnStatusVendor = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const { orderId, itemId } = req.params;
    const { newStatus } = req.body;
    // if (req.body.vendorReason) {
    //   const { vendorReason } = req.body;
    // }
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    const item = order.orderedItems.find(
      (item) => item._id.toString() === itemId
    );
    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.vendorID.toString() !== vendorId.toString()) {
      return res.status(403).json({ message: "Unauthorized vendor" });
    }

    const current = item.returnStatus;

    if (current === "Rejected" || current === "Completed") {
      return res.status(400).json({ message: "No further updates allowed" });
    }

    if (current === "Requested" && newStatus === "Completed") {
      return res.status(400).json({ message: "Approve before completing" });
    }

    if (current === "Approved" && newStatus !== "Completed") {
      return res.status(400).json({
        message: "Approved return can only be marked as Completed",
      });
    }

    item.returnStatus = newStatus;

    if (newStatus === "Completed") {
      const variant = await Variant.findById(item.variantID);
      if (variant) {
        const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);
        if (sizeObj) sizeObj.stock += item.quantity;
        await variant.save();
      }

      item.refundStatus = "Pending";
    }
    if (newStatus === "Rejected") {
      item.vendorReason = req.body.vendorReason;
    }

    await order.save();

    res.json({
      success: true,
      message: "Return status updated",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
