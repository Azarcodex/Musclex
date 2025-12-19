import Product from "../../models/products/Product.js";

export const toggleProductStatus = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res
        .status(404)
        .json({ success: false, message: "Product not found" });
    }

    // Toggle its state
    product.isActive = !product.isActive;

    await product.save();

    return res.status(200).json({
      success: true,
      message: `Product ${product.isActive ? "Activated" : "Deactivated"}`,
      isActive: product.isActive,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Server error updating product status",
    });
  }
};

export const ControlProductFeature = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }
    product.isFeatured = !product.isFeatured;
    await product.save();
    res.status(200).json({ message: "updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server Error" });
  }
};
