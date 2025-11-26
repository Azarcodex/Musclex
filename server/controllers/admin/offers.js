import Offer from "../../models/offer/offer.js";

export const createAdminCategoryOffer = async (req, res) => {
  try {
    const { categoryId, discountType, value, startDate, endDate } = req.body;

    if (!categoryId || !discountType || !value || !startDate || !endDate) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!["percent", "flat"].includes(discountType)) {
      return res.status(400).json({ message: "Invalid discount type" });
    }

    // Admin discount should never be > 80%
    if (discountType === "percent" && value > 80) {
      return res
        .status(400)
        .json({ message: "Percent discount cannot exceed 80%" });
    }

    const offer = new Offer({
      createdBy: "Admin",
      creatorId: req.admin._id,
      scope: "Category",
      categoryId,
      discountType,
      value,
      startDate,
      endDate,
      isActive: true,
    });

    await offer.save();

    return res.status(201).json({
      success: true,
      message: "Category offer created successfully",
      offer,
    });
  } catch (error) {
    console.log("Offer Create Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//get offers
export const getAllOffers = async (req, res) => {
  try {
    const offers = await Offer.find({createdBy:"Admin"})
      .populate("categoryId", "catgName")
      .populate("productIds", "name")
      .populate("creatorId", "name email");

    const formatted = offers.map((o) => ({
      id: o._id,
      createdBy: o.createdBy,
      creator: o.creatorId ? o.creatorId.name : null,
      creatorEmail: o.creatorId ? o.creatorId.email : null,

      scope: o.scope,
      categoryName: o.categoryId?.catgName || null,
      products: o.productIds?.map((p) => p.name) || [],

      discountType: o.discountType,
      value: o.value,

      startDate: o.startDate,
      endDate: o.endDate,
      isActive: o.isActive,
    }));

    return res.status(200).json({
      success: true,
      offers: formatted,
    });
  } catch (error) {
    console.log("Get Offers Error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

//update offers

export const updateCategoryOffer = async (req, res) => {
  try {
    const { offerId } = req.params;
    const { categoryId, discountType, value, startDate, endDate } =
      req.body.data;
    console.log(req.body);
    const offer = await Offer.findById(offerId);
    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Allow ONLY admin category offers to be updated
    if (offer.createdBy !== "Admin" || offer.scope !== "Category") {
      return res.status(400).json({
        message: "Only admin category offers can be updated",
      });
    }
    if (categoryId) offer.categoryId = categoryId;

    if (discountType) {
      if (!["percent", "flat"].includes(discountType)) {
        return res.status(400).json({ message: "Invalid discount type" });
      }
      offer.discountType = discountType;
    }

    if (value !== undefined) {
      if (offer.discountType === "percent" && value > 80) {
        return res.status(400).json({
          message: "Percent discount cannot exceed 80%",
        });
      }
      offer.value = value;
    }

    if (startDate) offer.startDate = startDate;
    if (endDate) offer.endDate = endDate;

    await offer.save();
    // console.log(offer);
    res.status(200).json({
      success: true,
      message: "Offer updated successfully",
      offer,
    });
  } catch (error) {
    console.log("Update Offer Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//visivility
export const toggleOfferVisibility = async (req, res) => {
  try {
    const { offerId } = req.params;

    if (!offerId || offerId === "undefined") {
      return res.status(400).json({ message: "Invalid Offer ID" });
    }

    const offer = await Offer.findById(offerId);

    if (!offer) {
      return res.status(404).json({ message: "Offer not found" });
    }

    // Toggle
    offer.isActive = !offer.isActive;

    await offer.save();

    return res.status(200).json({
      success: true,
      message: `Offer is now ${offer.isActive ? "Visible" : "Hidden"}`,
      offer,
    });
  } catch (error) {
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
