import Cart from "../../models/products/cart.js";
import Variant from "../../models/products/Variant.js";
import Address from "../../models/users/address.js";
import Order from "../../models/users/order.js";
import User from "../../models/users/user.js";

export const OrderController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId, paymentMethod } = req.body;

    const cartitems = await Cart.find({ userId })
      .populate("productId", "name")
      .populate("variantId", "size flavour");

    if (!cartitems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

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
      const variant = item.variantId;
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
      if (sizeObj.stock < cartitems.quantity) {
        return res
          .status(400)
          .json({ message: `Stock not available for item ${sizeObj.label}` });
      }
      sizeObj.stock -= item.quantity;
      await variant.save();
    }

    const orderedItems = cartitems.map((item) => {
      if (!item.productId || !item.variantId) {
        throw new Error("Product or Variant missing in cart");
      }

      return {
        productID: item.productId._id,
        variantID: item.variantId._id,
        quantity: item.quantity,
        price: item.price,
        sizeLabel: item.sizeLabel,
      };
    });

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

      // NEW ORDER LEVEL STATUS
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
