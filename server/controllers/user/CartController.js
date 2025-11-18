// import Variant from "../../../models/products/Variant.js";
import Cart from "../../models/products/cart.js";
import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";
export const AddCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, sizeLabel, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product.isActive) {
      return res.status(400).json({ message: "Item is being deactivated" });
    }
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(404).json({ message: "Variant not found" });
    }
    const size = variant.size.find((s) => s.label === sizeLabel);
    if (!size) return res.status(404).json({ message: "Invalid size" });
    const price = size.salePrice;
    const existing = await Cart.findOne({
      userId,
      productId,
      sizeLabel,
      variantId,
    });
    if (existing) {
      return res.status(200).json({ message: "Item is already in cart" });
    } else {
      await Cart.create({ userId, productId, variantId, price, sizeLabel });
    }
    res.status(200).json({ message: "Item added to the cart" });
  } catch (e) {
    res.status(500).json({ message: "Internal server error" });
  }
};

//getcart
export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const BASE_URL = process.env.BASE_URL;
    const items = await Cart.find({ userId: userId })
      .populate({
        path: "productId",
        select: "name brandID Avgrating catgid",
        populate: [
          { path: "brandID", select: "brand_name" },
          { path: "catgid", select: "catgName" },
        ],
      })
      .populate({ path: "variantId", select: "flavour images size" })
      .lean();
    if (!items.length) {
      return res.status(200).json({
        success: true,
        items: [],
        totalItems: 0,
        totalAmount: 0,
      });
    }
    const formatted = items.map((item) => {
      const selectedSize =
        item.variantId?.size?.find((s) => s.label === item.sizeLabel) || null;
      return {
        _id: item._id,
        productName: item.productId?.name,
        brandName: item.productId?.brandID?.brand_name,
        flavour: item.variantId?.flavour || "N/A",
        sizeLabel: item.sizeLabel,
        // price: item.price,
        quantity: item.quantity,
        image:
          item.variantId?.images?.length > 0
            ? `${BASE_URL}${item.variantId.images[0]}`
            : null,
        variantId: item.variantId?._id,
        productId: item.productId?._id,

        stock: selectedSize?.stock ?? 0,

        price: selectedSize?.salePrice,
      };
    });

    const totalAmount = formatted.reduce(
      (acc, val) => acc + val.price * val.quantity,
      0
    );
    res.status(200).json({
      success: true,
      items: formatted,
      totalItems: formatted.length,
      totalAmount,
    });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

//remove from cart
export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;
    const cart = await Cart.findOneAndDelete({ _id: id, userId: userId });
    if (!cart) {
      return res.status(404).json({ message: "item not found" });
    }
    res.status(200).json({ success: true, message: "Deleted successfully" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};
//quantity
export const QuantityChange = async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body;
    const userId = req.user._id;
    const cart = await Cart.findOne({ _id: id, userId: userId });
    if (!cart) {
      return res.status(404).jso0n({ message: "Item not found" });
    }
    const variant = await Variant.findById(cart.variantId);
    const sizeArr = variant?.size?.find((s) => s.label === cart.sizeLabel);
    let stock = sizeArr.stock;
    switch (action) {
      case "inc":
        if (cart.quantity + 1 > stock) {
          return res
            .status(400)
            .json({ message: "stock not available for these quantity" });
        }
        cart.quantity += 1;
        break;
      case "dec":
        if (cart.quantity > 1) {
          cart.quantity -= 1;
        } else {
          return res.json({ message: "minimum quantity is 1" });
        }
        break;
      default:
        return res.status(404).json({ message: "Error occurred" });
    }
    await cart.save();
    res.status(200).json({ message: "Updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error occurred" });
  }
};
