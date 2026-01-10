import { showFeaturedProductsRepo } from "../repositories/featured.repository.js";

export const featuredProductService = async () => {
  return showFeaturedProductsRepo();
};
