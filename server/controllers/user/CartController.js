// import Variant from "../../../models/products/Variant.js";
import Cart from "../../models/products/cart.js";
import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";
import Offer from "../../models/offer/offer.js";
import Wishlist from "../../models/products/wishlist.js";
export const AddCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, sizeLabel, quantity } = req.body;
    console.log(productId, variantId, sizeLabel);
    const product = await Product.findById(productId);
    // if (!product.isActive) {
    //   return res.status(400).json({ message: "Item is being deactivated" });
    // }
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
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

//add to cart from wishList

export const AddCartFromWishList = async (req, res) => {
  try {
    const userId = req.user._id;
    const { productId, variantId, sizeLabel, quantity } = req.body;
    // console.log(productId, variantId, sizeLabel);
    const product = await Product.findById(productId);
    // if (!product.isActive) {
    //   return res.status(400).json({ message: "Item is being deactivated" });
    // }
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
      await Cart.create({
        userId,
        productId,
        variantId,
        price,
        sizeLabel,
        fromWishList: true,
      });
      await Wishlist.deleteOne({
        userId: userId,
        productId: productId,
        variantId: variantId,
        sizeLabel: sizeLabel,
      });
    }
    res.status(200).json({ message: "Item added to the cart" });
  } catch (e) {
    console.log(e);
    res.status(500).json({ message: "Internal server error" });
  }
};

//getcart

export const getCart = async (req, res) => {
  try {
    const userId = req.user._id;
    const BASE_URL = process.env.BASE_URL;

    // Load cart
    const items = await Cart.find({ userId })
      .populate({
        path: "productId",
        select: "name brandID Avgrating catgid vendorID",
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

    // Fetch Active Offers
    const today = new Date();

    const activeCategoryOffers = await Offer.find({
      isActive: true,
      scope: "Category",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    const activeProductOffers = await Offer.find({
      isActive: true,
      scope: "Product",
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).lean();

    // -------- PROCESS EACH CART ITEM (APPLY BEST OFFER) --------
    const formatted = items
      .map((item) => {
        const sizeObj = item.variantId?.size?.find(
          (s) => s.label === item.sizeLabel
        );

        if (!sizeObj) return null;

        const salePrice = Number(sizeObj.salePrice);

        // ---- CATEGORY OFFER ----
        const categoryOffer = activeCategoryOffers.find(
          (off) =>
            off.categoryId?.toString() === item.productId.catgid._id.toString()
        );

        // ---- PRODUCT OFFER ----
        const productOffer = activeProductOffers.find((off) =>
          off.productIds.some(
            (pid) => pid.toString() === item.productId._id.toString()
          )
        );

        // ---- COMPUTE DISCOUNT ----
        const computeDiscount = (offer) => {
          if (!offer) return 0;

          if (offer.discountType === "percent") {
            return Math.floor((salePrice * offer.value) / 100);
          } else {
            return offer.value;
          }
        };

        const catDiscount = computeDiscount(categoryOffer);
        const prodDiscount = computeDiscount(productOffer);

        let bestOffer = null;
        let bestDiscount = 0;

        if (catDiscount > prodDiscount) {
          bestOffer = categoryOffer;
          bestDiscount = catDiscount;
        } else if (prodDiscount > 0) {
          bestOffer = productOffer;
          bestDiscount = prodDiscount;
        }

        let finalPrice = salePrice;

        if (bestOffer) {
          finalPrice = Math.max(salePrice - bestDiscount, 1);
        }

        return {
          _id: item._id,
          productName: item.productId?.name,
          brandName: item.productId?.brandID?.brand_name,
          flavour: item.variantId?.flavour,
          sizeLabel: item.sizeLabel,
          quantity: item.quantity,
          image:
            item.variantId?.images?.length > 0
              ? `${BASE_URL}${item.variantId.images[0]}`
              : null,

          // base pricing
          salePrice,
          price: salePrice,

          // offer details
          offerApplied: !!bestOffer,
          offerType: bestOffer?.discountType || null,
          offerValue: bestOffer?.value || 0,
          offerAmount: bestDiscount,
          finalPrice,

          // important data
          variantId: item.variantId?._id,
          productId: item.productId?._id,
          vendorID: item.productId?.vendorID,
          stock: sizeObj.stock ?? 0,
        };
      })
      .filter(Boolean);

    // FINAL TOTAL
    const totalAmount = formatted.reduce(
      (sum, it) => sum + it.finalPrice * it.quantity,
      0
    );

    res.status(200).json({
      success: true,
      items: formatted,
      totalItems: formatted.length,
      totalAmount,
    });
  } catch (err) {
    console.log("getCart error:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

//remove from cart
export const removeFromCart = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // Find the cart item (to check origin)
    const cartItem = await Cart.findOne({ _id: id, userId });
    if (!cartItem) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { productId, variantId, sizeLabel, fromWishList } = cartItem;

    // Delete from cart
    await Cart.deleteOne({ _id: id, userId });

    if (fromWishList) {
      const exists = await Wishlist.findOne({
        userId,
        productId,
        variantId,
        sizeLabel,
      });

      if (!exists) {
        await Wishlist.create({
          userId,
          productId,
          variantId,
          sizeLabel,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Moved back to wishlist",
      });
    }

    // Normal cart item → just remove
    return res.status(200).json({
      success: true,
      message: "Cart item removed",
    });
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

//validate cart

export const validatCart = async (req, res) => {
  try {
    const userId = req.user._id;

    const cartItems = await Cart.find({ userId: userId })
      .populate({
        path: "productId",
        select: "name isActive vendorID catgid",
      })
      .populate({
        path: "variantId",
        select: "size flavour",
      })
      .lean();
    const errors = [];
    if (!cartItems.length) {
      return res.status(400).json({
        valid: false,
        errors: [{ message: "Your cart is empty" }],
      });
    }

    for (const item of cartItems) {
      const product = item.productId;
      const variant = item.variantId;

      if (!product || !variant) {
        errors.push({
          cartItemId: item._id,
          message: "A product in your cart no longer exists",
        });
        continue;
      }

      if (!product.isActive) {
        errors.push({
          cartItemId: item._id,
          message: `${product.name} is no longer available`,
        });
        continue;
      }

      // const vendor = await Vendor.findById(product.vendorID).lean();
      // if (!vendor || vendor.isActive === false) {
      //   errors.push({
      //     cartItemId: item._id,
      //     message: `${product.name}'s vendor is not active`,
      //   });
      //   continue;
      // }

      const sizeObj = variant.size?.find((s) => s.label === item.sizeLabel);

      if (!sizeObj) {
        errors.push({
          cartItemId: item._id,
          message: `Selected size (${item.sizeLabel}) is no longer available`,
        });
        continue;
      }

      const stock = sizeObj.stock;

      if (stock <= 0) {
        errors.push({
          cartItemId: item._id,
          message: `${product.name} (${item.sizeLabel}) is out of stock,kindly remove it`,
        });
        continue;
      }

      // if (item.quantity > stock) {
      //   errors.push({
      //     cartItemId: item._id,
      //     message: `Only ${stock} left for ${product.name} (${item.sizeLabel})`,
      //   });
      //   continue;
      // }
    }

    if (errors.length > 0) {
      return res.status(400).json({
        valid: false,
        errors,
      });
    }

    return res.status(200).json({
      valid: true,
      message: "Cart validation successful",
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({
      valid: false,
      errors: [{ message: "Server error validating cart" }],
    });
  }
};
