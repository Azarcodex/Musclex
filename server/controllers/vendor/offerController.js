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
    console.log(offers);
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

export const toggleVendorOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const vendorId = req.vendor._id;

    // Find offer
    const offer = await Offer.findOne({ _id: offerId, creatorId: vendorId });

    if (!offer) {
      return res
        .status(404)
        .json({ success: false, message: "Offer not found or unauthorized" });
    }

    // Prevent vendor from modifying admin offers
    if (offer.createdBy !== "Vendor") {
      return res.status(403).json({
        success: false,
        message: "You cannot modify admin offers",
      });
    }

    // Toggle active state
    offer.isActive = !offer.isActive;
    await offer.save();

    return res.status(200).json({
      success: true,
      message: `Offer ${
        offer.isActive ? "Activated" : "Deactivated"
      } successfully`,
      isActive: offer.isActive,
    });
  } catch (error) {
    console.error("Toggle Offer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Server Error",
    });
  }
};

//edit offer

export const editVendorOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const vendorId = req.vendor._id;

    const offer = await Offer.findOne({
      _id: offerId,
      creatorId: vendorId,
      createdBy: "Vendor",
      scope: "Product",
    });

    if (!offer) {
      return res.status(404).json({
        success: false,
        message: "Offer not found or you are not allowed to edit this offer",
      });
    }

    const { discountType, value, startDate, endDate, productIds } = req.body;

    if (discountType) offer.discountType = discountType;
    if (value !== undefined) offer.value = value;
    if (startDate) offer.startDate = startDate;
    if (endDate) offer.endDate = endDate;

    if (productIds) offer.productIds = productIds;

    await offer.save();

    return res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    console.error("Vendor Edit Offer Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
