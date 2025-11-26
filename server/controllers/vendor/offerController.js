import Product from "../../models/products/Product.js";
import Offer from "../../models/offer/offer.js";

export const createProductOffer = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const { productIds, discountType, value, startDate, endDate } = req.body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({ message: "Select at least one product" });
    }

    const products = await Product.find({
      _id: { $in: productIds },
      vendorID: vendorId,
    });

    if (products.length !== productIds.length) {
      return res.status(403).json({
        message: "You cannot create offer for other vendor's products",
      });
    }

    const offer = await Offer.create({
      createdBy: "Vendor",
      creatorId: vendorId,

      scope: "Product",
      productIds,

      discountType,
      value,

      startDate,
      endDate,
    });

    res.status(201).json({
      success: true,
      message: "Product offer created successfully",
      offer,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};
//get product offers
export const getVendorOffers = async (req, res) => {
  try {
    const vendorId = req.vendor._id;

    const offers = await Offer.find({
      createdBy: "Vendor",
      creatorId: vendorId,
      scope: "Product",
    })
      .populate("productIds", "name _id")
      .lean();
      console.log(offers)
    res.status(200).json({
      success: true,
      offers,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Server error" });
  }
};

//drop down products
export const getAllProducts = async (req, res) => {
  try {
    const vendorId = req.vendor._id;
    const products = await Product.find({ vendorID: vendorId })
      .select("name _id")
      .lean();
    res.status(200).json({
      success: true,
      products,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
