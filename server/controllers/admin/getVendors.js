import Vendor from "../../models/vendors/Vendor.js";

export const getVendors = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    console.log(page);
    const limit = parseInt(req.query.limit);
    const totalVendors = await Vendor.countDocuments();
    const skip = (page - 1) * limit;
    const vendors = await Vendor.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const totalPages = totalVendors / limit;
    res.status(200).json({
      success: true,
      vendors,
      pagination: {
        totalVendors,
        limit,
        currentPage: page,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ success: true, message: "server error occured" });
  }
};
//status controller
export const updateVendorStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const updated = await Vendor.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    res.status(200).json({ success: true, updated });
    console.log("donexxxxx");
  } catch (error) {
    res.status(500).json({ message: "server error occurred" });
  }
};
//can add product
export const canAddProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const vendor = await Vendor.findById(id);
    if (!vendor) {
      return res.json({ success: false, message: "Vendor not found" });
    }
    vendor.canAddProduct = !vendor.canAddProduct;
    console.log("done");
    await vendor.save();
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.error });
  }
};
