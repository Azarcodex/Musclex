import api from "../../api/axios";

export const createProductOffer = async (payload) => {
  const response = await api.post("/api/vendor/product-offer", payload);
  return response.data;
};

// GET all product offers for vendor
export const getProductOffers = async () => {
  const response = await api.get("/api/vendor/product-offer");
  return response.data;
};
