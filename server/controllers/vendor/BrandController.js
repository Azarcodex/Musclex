import Brand from "../../models/products/brand.js";
import Product from "../../models/products/Product.js";

// Add brand
export const addBrand = async (req, res) => {
  try {
    const { brand_name } = req.body;
    const vendorID = req.vendor._id;
    const existing = await Brand.findOne({ brand_name, vendorID });
    if (existing)
      return res.status(400).json({ message: "Brand already exists" });

    const newBrand = new Brand({ brand_name, vendorId: vendorID });
    await newBrand.save();

    res.status(201).json({ message: "Brand added", brand: newBrand });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to add brand" });
  }
};

// Get all brands for vendor
export const getBrands = async (req, res) => {
  try {
    const vendorID = req.vendor._id;
    if (!vendorID) {
      return res
        .status(401)
        .json({ success: false, message: "vendor not found" });
    }
    const brands = await Brand.find({
      vendorId: vendorID,
    }).sort({ createdAt: -1 });
    res.json(brands);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Failed to fetch brands" });
  }
};

// Delete brand
export const deleteBrand = async (req, res) => {
  try {
    const vendorID = req.vendor._id;
    const { id } = req.params;

    // Ensure vendor owns this brand
    const brand = await Brand.findOne({ _id: id, vendorId: vendorID });
    if (!brand)
      return res
        .status(404)
        .json({ message: "Brand not found for this vendor" });

    await Brand.findByIdAndDelete(id);

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete brand" });
  }
};

// Update brand
export const updateBrand = async (req, res) => {
  try {
    const vendorID = req.vendor._id;
    const { id } = req.params;
    const { brand_name } = req.body;

    const brand = await Brand.findOne({ _id: id, vendorId: vendorID });
    if (!brand)
      return res
        .status(404)
        .json({ message: "Brand not found for this vendor" });

    await Brand.findByIdAndUpdate(id, { brand_name }, { new: true });

    res.status(200).json({ success: true, message: "Updated successfully" });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

//for user
export const fetchBrandUser = async (req, res) => {
  try {
    const brand = await Brand.find({ isActive: true }).sort({
      createdAt: -1,
    });
    res.json(brand);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

//handle visibility
export const visibilityBrand = async (req, res) => {
  try {
    const vendorID = req.vendor._id;
    const { id } = req.params;
    const brand = await Brand.findOne({ _id: id, vendorId: vendorID });
    if (!brand) {
      return res
        .status(404)
        .json({ success: false, message: "Brand not found" });
    }

    const newStatus = !brand.isActive;

    await Brand.findByIdAndUpdate(id, { isActive: newStatus });

    await Product.updateMany(
      { brandID: id, vendorID: vendorID },
      { isActive: newStatus }
    );

    const message = newStatus
      ? "Brand enabled and products restored"
      : "Brand hidden and products disabled";

    return res.status(200).json({
      success: true,
      message,
      brandID: id,
      newStatus,
    });
  } catch (error) {
    console.error("Brand visibility update error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to update visibility" });
  }
};
