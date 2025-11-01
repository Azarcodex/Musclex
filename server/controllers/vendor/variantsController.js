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
    const payload = req.body;
    // console.log(payload);
    console.log(req.files)
    // attach uploaded image URLs
    if (req.files && req.files.length > 0) {
      payload.images = req.files.map((f) => `/uploads/${f.filename}`);
    }

    const variant = new Variant(payload);
    await variant.save();

    res.status(201).json({ success: true, variant });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: error.message });
  }
};
