import Product from "../../models/products/Product.js";
import Variant from "../../models/products/Variant.js";

export const getVariantsByProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const variants = await Variant.find({ productId });
    res.json({ success: true, variants });
  } catch (error) {
    console.error("Error fetching variants:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
export const addVariant = async (req, res) => {
  try {
    const { productId } = req.body;
    let flavour = (req.body.flavour || "default").trim();

    if (!productId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    let sizes = [];
    try {
      sizes = JSON.parse(req.body.size);
      if (sizes.length === 0) {
        return res.status(400).json({ message: "Size files is empty" });
      }
    } catch (error) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid JSON format for sizes." });
    }
    //image handle
    const imageData =
      req.files?.map((file) => `/uploads/${file.filename}`) || [];

    //existing check
    const existing = await Variant.findOne({ flavour, productId });
    if (existing) {
      const existingSize = existing.size.map((exist) => exist.label);
      const newSize = sizes.filter((size) => !existingSize.includes(size));
      if (newSize.length === 0) {
        return res
          .status(400)
          .json({ message: "Size already exist in these flavour" });
      }
      existing.size.push(...sizes);
      await existing.save();
      return res.status(200).json({
        success: true,
        message: "New sizes added to existing flavour.",
        variant: existing,
      });
    }
    const newVariant = await Variant.create({
      productId: productId,
      flavour: flavour,
      size: sizes,
      images: imageData,
    });
    return res.status(201).json({
      success: true,
      message: "New  variant added successfully!",
      variant: newVariant,
    });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};
export const relatedProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    console.log(productId);
    const product = await Product.findById(productId)
      .populate("catgid", "catgName")
      .populate("brandID", "brand_name");
    if (!product) {
      return res.status(401).json({ message: "product not found" });
    }
    res.status(200).json({ success: true, product: product });
  } catch (e) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export const EditVariant = async (req, res) => {
  try {
    const { variantId } = req.params;
    const { flavour } = req.body;
    const payload = JSON.parse(req.body.size);
    const files = req.files;
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res
        .status(404)
        .json({ success: false, message: "Variant not found" });
    }
    if (files && files.length > 0) {
      const new_image = files.map((file) => `/uploads/${file.filename}`);
      variant.images = [...variant.images, ...new_image];
    }
    if (flavour) {
      variant.flavour = flavour;
    }
    if (payload) {
      variant.size = payload;
    }
    await variant.save();
    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "internal server error" });
  }
};
//
export const editVariantImage = async (req, res) => {
  try {
    const { variantId, src } = req.body.variantId;
    console.log(variantId, src);
    const variant = await Variant.findById(variantId);
    if (!variant) {
      return res.status(401).json({ message: "Image not found" });
    }
    variant.images = variant.images.filter((i) => i !== src);
    await variant.save();
  } catch (e) {
    console.log(e);
    res
      .status(500)
      .json({ success: false, message: "Internal server occurred" });
  }
};

export const DeleteVariant = async () => {};
