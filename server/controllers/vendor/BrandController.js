import Brand from "../../models/products/brand.js";

// Add brand
export const addBrand = async (req, res) => {
  try {
    const { brand_name } = req.body;
    const existing = await Brand.findOne({ brand_name });
    if (existing)
      return res.status(400).json({ message: "Brand already exists" });

    const newBrand = new Brand({ brand_name });
    await newBrand.save();
    res.status(201).json({ message: "Brand added", brand: newBrand });
  } catch (err) {
    res.status(500).json({ message: "Failed to add brand" });
  }
};

// Get all brands
export const getBrands = async (req, res) => {
  try {
    const brands = await Brand.find({ isActive: true }).sort({ createdAt: -1 });
    res.json(brands);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch brands" });
  }
};

export const deleteBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const brand = await Brand.findByIdAndDelete(id);
    res.json({ message: "deleted sucessfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete brand" });
  }
};

export const updateBrand = async (req, res) => {
  try {
    const { id } = req.params;
    const { brand_name } = req.body;
    const brand = await Brand.findById(id);
    if (!brand) {
      return res.json({ message: "Data not found" });
    }
    const updated = await Brand.findByIdAndUpdate(
      id,
      { brand_name: brand_name },
      { new: true }
    );
    res.status(201).json({ success: true, message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
