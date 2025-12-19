import { homeBannerService } from "../../services/homebanner.service.js";

export const homeBannerController = async (req, res) => {
  try {
    const slides = await homeBannerService();
    res.status(201).json({ success: true, slides });
  } catch (error) {
    res.status(500).json({ success: false, message: "Internal server Error" });
  }
};
