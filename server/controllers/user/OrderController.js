import Cart from "../../models/products/cart.js";
import Address from "../../models/users/address.js";
import Order from "../../models/users/order.js";

export const OrderController = async (req, res) => {
  try {
    const userId = req.user._id;
    const { addressId, paymentMethod } = req.body;
    console.log("✅✅✅✅✅✅" + addressId, paymentMethod);
    const cartitems = await Cart.find({ userId })
      .populate("productId", "name")
      .populate("variantId", "size flavour");
    if (!cartitems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const address = await Address.findOne({ _id: addressId });
    console.log(address);
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
    const orderedItems = cartitems.map((item) => ({
      productID: item.productId._id,
      variantID: item.variantId._id,
      quantity: item.quantity,
      price: item.price,
    }));
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
      finalAmount: totalPrice,
      paymentMethod: paymentMethod,
      paymentStatus: paymentMethod === "COD" ? "Pending" : "Paid",
    });
    await order.save();
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
