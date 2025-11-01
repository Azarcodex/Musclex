import Product from "../../models/products/Product.js";
import Vendor from "../../models/vendors/Vendor.js";

export const getVendorProducts = async (req, res) => {
  try {
    const vendors = await Vendor.aggregate([
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "vendorID",
          as: "products",
        },
      },
      {
        $addFields: {
          totalProducts: { $size: { $ifNull: ["$products", []] } }, // ✅ fixes the error
        },
      },
      {
        $project: {
          shopName: 1,
          email: 1,
          totalProducts: 1,
        },
      },
    ]);
    res.status(200).json({ success: true, vendors });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};
//vendor idividual products
export const fetchVendorProducts = async function (req,res) {
  try {
    const { vendorId } = req.params;
    console.log(vendorId)
    const vendor=await Vendor.findById(vendorId)
    if (!vendor) {
      return res.json({ message: "Vendor not found" });
    }
    const products = await Product.find({ vendorID: vendorId })
    .populate("brandID","brand_name").populate("catgid","catgName");
    res.status(200).json({ success: true, message: "product fetched",products:products });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error occurred" });
  }
};
