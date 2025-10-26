import mongoose from "mongoose";
import Variant from "../../models/products/Variant.js";

export const addVariant = async (req, res) => {
  try {
    const {
      productId,
      color,
      size,
      flavour,
      stock,
      oldPrice,
      discount,
      salePrice,
      images,
    } = req.body;
    const variant = new Variant({
      productId,
      color,
      size,
      flavour,
      stock,
      oldPrice,
      discount,
      salePrice,
      images,
    });

    await variant.save();
    res.status(201).json({ success: true, message: "Variant added", variant });
  } catch (error) {
    res.status(500).json({ success: false, message: "server error" });
  }
};
