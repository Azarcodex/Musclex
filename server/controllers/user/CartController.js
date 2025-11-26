// import Variant from "../../../models/products/Variant.js";
import Cart from "../../models/products/cart.js";
import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";
import Offer from "../../models/offer/offer.js";
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
    const today = new Date();
    const activeOffers = await Offer.find({
      isActive: true,
      scope: "Category",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();
    const formatted = items.map((item) => {
      const selectedSize =
        item.variantId?.size?.find((s) => s.label === item.sizeLabel) || null;
      let finalPrice = selectedSize.salePrice;
      let offerApplied = false;
      let offerValue = 0;
      let offerType = "";
      let offerAmount = 0;
      const catOffer = activeOffers.find(
        (off) =>
          off.categoryId.toString() === item?.productId?.catgid?._id.toString()
      );
      // console.log(catOffer);
      if (catOffer) {
        offerApplied = true;
        offerType = catOffer.discountType;
        offerValue = catOffer.value;

        if (catOffer.discountType === "percent") {
          offerAmount = Math.floor((selectedSize.salePrice * offerValue) / 100);
        } else {
          offerAmount = offerValue;
        }

        finalPrice = Math.max(selectedSize.salePrice - offerAmount, 1);
      }
      return {
        _id: item._id,
        productName: item.productId?.name,
        brandName: item.productId?.brandID?.brand_name,
        flavour: item.variantId?.flavour || "N/A",
        sizeLabel: item.sizeLabel,
        quantity: item.quantity,
        salePrice: selectedSize.salePrice,
        image:
          item.variantId?.images?.length > 0
            ? `${BASE_URL}${item.variantId.images[0]}`
            : null,
        variantId: item.variantId?._id,
        productId: item.productId?._id,

        stock: selectedSize?.stock ?? 0,

        price: selectedSize?.salePrice,
        offerApplied,
        offerType,
        offerValue,
        offerAmount,
        finalPrice,
      };
    });

    const totalAmount = formatted.reduce(
      (acc, val) => acc + val.finalPrice * val.quantity,
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
