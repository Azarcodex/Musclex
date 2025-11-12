import Wishlist from "../../../models/products/wishlist.js";

export const AddWishList = async (req, res) => {
  try {
    const { productId, variantId } = req.body;
    // console.log(productId, variantId);
    const user = req.user;
    // const product = await Product.findById(productId);
    // const variant = await Variant.findById(variantId);
    const userId = user._id;
    const wishList = await Wishlist.create({
      productId: productId,
      userId: userId,
      variantId: variantId,
    });
    res
      .status(200)
      .json({ success: true, message: "liked successfully", wishList });
  } catch (err) {
    console.log(err);
    res.status(500).json({ success: false, message: "Failed to Add Product" });
  }
};
export const removeWishList = async (req, res) => {
  try {
    const { id } = req.params;
    const wishList = await Wishlist.findByIdAndDelete(id);
    res
      .status(200)
      .json({ success: true, message: "item removed from wishList" });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
//getWishlist
export const getWishList = async (req, res) => {
  try {
    const user = req.user;
    const userId = user._id;
    const wishList = await Wishlist.find({ userId: userId })
      .populate({
        path: "productId",
        populate: [
          { path: "catgid", select: "catgName" },
          { path: "brandID", select: "brand_name" },
        ],
      })
      .populate("variantId")
      .lean();

    res.status(200).json({ success: true, wishList });
  } catch (error) {
    res.status(500).json({ message: "server down" });
  }
};
