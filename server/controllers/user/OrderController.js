import Cart from "../../models/products/cart.js";
import Variant from "../../models/products/Variant.js";
import Address from "../../models/users/address.js";
import Order from "../../models/users/order.js";
import User from "../../models/users/user.js";
import { computeOrderStatus } from "./computation/status.js";

export const OrderController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { items, addressId, paymentMethod } = req.body;
    console.log("✅✅✅✅✅✅✅✅✅" + JSON.stringify(items));
    let cartitems = [];
    if (items) {
      cartitems = items;
    } else {
      const cartitems = await Cart.find({ userId })
        .populate("productId", "name vendorID")
        .populate("variantId", "size flavour");
      if (!cartitems) {
        return res.status(401).json({ message: "No items in cart" });
      }
    }
    console.log(cartitems);
    const address = await Address.findOne({ _id: addressId });
    if (!address) {
      return res
        .status(404)
        .json({ success: false, message: "Address not found" });
    }

    const shippingAddress = {
      fullName: address.fullName,
      phone: address.phone,
      pincode: address.pincode,
      state: address.state,
      city: address.city,
      addressLine: address.addressLine,
      landmark: address.landmark,
    };

    const expectedDelivery = new Date();
    expectedDelivery.setDate(expectedDelivery.getDate() + 5);
    //stock managment
    for (const item of cartitems) {
      const variant = await Variant.findById(item.variantId._id);
      if (!variant || !variant.size) {
        return res
          .status(400)
          .json({ success: false, message: "Variant not found" });
      }
      const sizeObj = variant?.size?.find((s) => s.label === item.sizeLabel);
      if (!sizeObj) {
        return res
          .status(400)
          .json({ success: false, message: "Size not found" });
      }
      if (sizeObj.stock < item.quantity) {
        return res
          .status(400)
          .json({ message: `Stock not available for item ${sizeObj.label}` });
      }
      sizeObj.stock -= item.quantity;
      await variant.save();
    }
    const orderedItems = cartitems.map((item) => {
      if (!item.variantId.productId || !item.variantId) {
        throw new Error("Product or Variant missing in cart");
      }

      // if (!item.productId.vendorID) {
      //   throw new Error("Vendor data missing");
      // }
      return {
        productID: item.productId._id,
        variantID: item?.variantId?._id,
        quantity: item.quantity,
        price: item.finalPrice,
        sizeLabel: item.sizeLabel,
        status: "Pending",
        vendorID: item.productId.vendorID,
      };
    });
    // console.log(orderedItems);
    const totalPrice = orderedItems.reduce(
      (acc, val) => acc + val.price * val.quantity,
      0
    );

    const order = new Order({
      userID: userId,
      addressID: addressId,
      orderedItems,
      shippingAddress,
      totalPrice,
      discount: 0,
      finalAmount: totalPrice,
      paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
      orderStatus: "Pending",

      expectedDelivery,
    });

    await order.save();
    await Cart.deleteMany({ userId });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//order summary
export const orderSummary = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const user = await User.findById(userId);
    const orderDetails = await Order.findOne({ userID: userId, _id: id });
    const response = {
      totalPrice: orderDetails.totalPrice,
      orderId: orderDetails.orderId,
      user: user.email,
      expectedDelivery: orderDetails?.expectedDelivery,
    };
    res.status(200).json({ success: true, result: response });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//order track and orders
export const getOrderList = async (req, res) => {
  try {
    const userId = req.user._id;

    const orders = await Order.find({ userID: userId })
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
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, message: orders });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//orderTrackage
export const OrderTrack = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const orders = await Order.find({ userID: userId, _id: id })
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
      .sort({ createdAt: -1 })
      .lean();
    res.status(200).json({ success: true, message: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//cancel order dealing
export const cancelOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const order = await Order.findOne({ _id: id, userID: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const cancellableStatuses = ["Pending", "Confirmed", "Processing"];

    if (!cancellableStatuses.includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it is ${order.orderStatus}`,
      });
    }

    for (const item of order.orderedItems) {
      const variant = await Variant.findById(item.variantID);
      if (!variant) continue;

      const sizeObj = variant.size.find((s) => s.label === item.sizeLabel);

      if (sizeObj) {
        sizeObj.stock += item.quantity;
      }

      await variant.save();
    }

    order.orderStatus = "Cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

//canceling individual product
export const cancelProductOrder = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, item_id } = req.params;
    console.log("✅✅✅" + item_id);
    const order = await Order.findOne({ _id: orderId, userID: userId });
    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    const product = order?.orderedItems?.find(
      (data) => data._id.toString() === item_id.toString()
    );
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "item not found",
      });
    }
    const cancellableStatuses = ["Pending", "Confirmed", "Processing"];
    if (!cancellableStatuses.includes(product.status)) {
      return res.status(400).json({
        success: false,
        message: `Order cannot be cancelled once it is ${product.status}`,
      });
    }
    const variant = await Variant.findById(product.variantID);
    const sizeObj = variant?.size?.find((s) => s.label === product.sizeLabel);
    if (sizeObj) {
      sizeObj.stock += product.quantity;
    }
    await variant.save();
    product.status = "Cancelled";
    await order.save();
    return res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: "Interal server error occurred" });
  }
};

//return controller
export const returnOrderItem = async (req, res) => {
  try {
    const userId = req.user._id;
    const { orderId, itemId } = req.params;
    const { reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.userID.toString() !== userId.toString()) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const item = order?.orderedItems?.find(
      (item) => item._id.toString() === itemId
    );
    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    //  Return only allowed for Delivered items
    if (item.status !== "Delivered") {
      return res.status(400).json({
        success: false,
        message: "Return only allowed after delivery",
      });
    }

    // Ensure deliveryDate exists
    if (!item.deliveredDate) {
      return res.status(400).json({
        success: false,
        message: "Delivery date missing. Cannot process return.",
      });
    }

    //  Apply 7-day return policy
    const now = new Date();
    const daysSinceDelivery =
      (now - new Date(item.deliveredDate)) / (1000 * 60 * 60 * 24);

    if (daysSinceDelivery > 7) {
      return res.status(400).json({
        success: false,
        message: "Return window expired (only 7 days allowed).",
      });
    }

    //  Update item return fields
    item.status = "Returned";
    item.returnStatus = "Requested";
    item.returnReason = reason;
    item.returnDate = now;

    order.orderStatus = computeOrderStatus(order.orderedItems);

    await order.save();

    return res.json({
      success: true,
      message: "Return requested successfully",
      order,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
