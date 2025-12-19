import Banner from "../models/Admin/banner.model.js";

export const createBannerRepo = (data) => {
  return Banner.create(data);
};

export const getActiveBannersRepo = () => {
  return Banner.find({}).sort({ createdAt: -1 });
};

export const getBannerByIdRepo = (id) => {
  return Banner.findById(id);
};

export const updateBannersRepo = (id, data) => {
  return Banner.findByIdAndUpdate(id, data, { new: true });
};

export const deleteBannersRepo = (id) => {
  return Banner.findByIdAndDelete(id);
};
