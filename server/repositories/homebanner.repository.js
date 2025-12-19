import bannerModel from "../models/Admin/banner.model.js";

export const homeBannersRepo = () => {
  return bannerModel.find({ isActive: true }).sort({ createdAt: -1 });
};
