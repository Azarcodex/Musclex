import { featuredProductService } from "../../../services/featuredproduct.service.js";

export const getFeaturedProductController = async (req, res) => {
  try {
    const featuredProduct = await featuredProductService();
    res.status(201).json({ success: true, featuredProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};
