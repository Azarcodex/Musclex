import { homeBannersRepo } from "../repositories/homebanner.repository.js";

export const homeBannerService = async () => {
  return homeBannersRepo();
};
