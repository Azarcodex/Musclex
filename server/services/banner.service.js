import {
  createBannerRepo,
  deleteBannersRepo,
  getActiveBannersRepo,
  getBannerByIdRepo,
  updateBannersRepo,
} from "../repositories/banner.repository.js";

export const createBannerService = async (payload) => {
  if (!payload.image) {
    throw new Error("Banner Image is Required");
  }
  return createBannerRepo(payload);
};

export const getActiveBannerService = async () => {
  return getActiveBannersRepo();
};

export const updateBannerService = async (id, payload) => {
  const banner = await getBannerByIdRepo(id);

  if (!banner) {
    throw new Error("Banner not found");
  }

  return updateBannersRepo(id, payload);
};

export const deleteBannerService = async (id) => {
  const banner = await getBannerByIdRepo(id);

  if (!banner) {
    throw new Error("Banner not found");
  }

  return deleteBannersRepo(id);
};
