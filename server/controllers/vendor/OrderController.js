import mongoose from "mongoose";
import Order from "../../models/users/order.js";
import { creditVendorForOrder } from "../walletService/vendor/vendorWalletService.js";

export const getOrdersData = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const orders = await Order.aggregate([
      // Unwind items so we can filter vendor's items
      { $unwind: "$orderedItems" },

      // Keep only items belonging to this vendor
      {
        $match: {
          "orderedItems.vendorID": vendorId,
        },
      },

      // Lookup product
      {
        $lookup: {
          from: "products",
          localField: "orderedItems.productID",
          foreignField: "_id",
          as: "product",
        },
      },
      { $unwind: "$product" },

      // Lookup variant
      {
        $lookup: {
          from: "variants",
          localField: "orderedItems.variantID",
          foreignField: "_id",
          as: "variant",
        },
      },
      { $unwind: "$variant" },

      // Lookup address
      {
        $lookup: {
          from: "addresses",
          localField: "addressID",
          foreignField: "_id",
          as: "address",
        },
      },
      { $unwind: "$address" },

      // Rebuild orderedItems in the same structure as frontend expects
      {
        $project: {
          _id: 1,
          orderId: "$_id",
          createdAt: 1,
          paymentMethod: 1,
          paymentStatus: 1,
          orderStatus: 1,
          expectedDelivery: 1,
          totalPrice: 1,
          discount: 1,
          finalAmount: 1,
          shippingAddress: "$address",

          orderedItem: {
            _id: "$orderedItems._id",
            productID: {
              _id: "$product._id",
              name: "$product.name",
            },
            flavour: "$variant.flavour",
            sizeLabel: "$orderedItems.sizeLabel",
            quantity: "$orderedItems.quantity",
            price: "$orderedItems.price",
            status: "$orderedItems.status",
          },
        },
      },

      // Re-group orders back into proper shape
      {
        $group: {
          _id: "$_id",
          orderId: { $first: "$orderId" },
          createdAt: { $first: "$createdAt" },
          paymentMethod: { $first: "$paymentMethod" },
          paymentStatus: { $first: "$paymentStatus" },
          orderStatus: { $first: "$orderStatus" },
          expectedDelivery: { $first: "$expectedDelivery" },
          totalPrice: { $first: "$totalPrice" },
          discount: { $first: "$discount" },
          finalAmount: { $first: "$finalAmount" },
          shippingAddress: { $first: "$shippingAddress" },

          orderedItems: { $push: "$orderedItem" },
        },
      },

      { $sort: { createdAt: -1 } },
    ]);

    return res.status(200).json({ success: true, message: orders });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error occurred",
    });
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
    // console.log(orderId, id);
    console.log("status📖📖📖📖" + status);
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

    //wallet credit
    if (status === "Delivered") {
      product.deliveredDate = new Date();

      if (product.vendorCreditStatus !== "Credited") {
        const itemAmount = product.price * product.quantity;

        await creditVendorForOrder({
          vendorId: product.vendorID,
          orderId,
          amount: itemAmount,
          commissionPercent: 10,
        });

        product.vendorCreditStatus = "Credited";
      }
    }

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
