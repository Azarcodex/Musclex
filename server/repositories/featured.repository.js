import Product from "../models/products/Product.js";

export const showFeaturedProductsRepo = () => {
  return Product.find({ isFeatured: true }).sort({ createdAt: -1 });
};
