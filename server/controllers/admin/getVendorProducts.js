import Product from "../../models/products/Product.js";
import Vendor from "../../models/vendors/Vendor.js";

export const getVendorProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const skip = (page - 1) * limit;
    const totalVendors = await Vendor.countDocuments();
    const { search } = req.query;
    const query = search
      ? {
          $or: [
            { shopName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
          ],
        }
      : {};
    const vendors = await Vendor.aggregate([
      {
        $match: query,
      },
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
          totalProducts: { $size: { $ifNull: ["$products", []] } },
        },
      },
      {
        $project: {
          shopName: 1,
          email: 1,
          totalProducts: 1,
        },
      },
      {
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);
    const totalPages = Math.ceil(totalVendors / limit);
    res.status(200).json({
      success: true,
      vendors,
      pagination: {
        totalProducts: totalVendors,
        current: page,
        totalPages: totalPages,
      },
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Internal error" });
  }
};
//vendor idividual products
export const fetchVendorProducts = async function (req, res) {
  try {
    const { vendorId } = req.params;
    // console.log(vendorId);
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.json({ message: "Vendor not found" });
    }
    const products = await Product.find({ vendorID: vendorId })
      .populate("brandID", "brand_name")
      .populate("catgid", "catgName");
    res
      .status(200)
      .json({ success: true, message: "product fetched", products: products });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Internal server error occurred" });
  }
};
