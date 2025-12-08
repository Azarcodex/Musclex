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

//toggle
export const toggleVendorOffer = async (offerId) => {
  const response = await api.patch(`/api/vendor/product/offer/toggle/${offerId}`);
  return response.data;
};

//edit
export const editVendorOfferService = async ({offerId, payload}) => {
  // console.log(offerId,payload)
  const response = await api.patch(
    `/api/vendor/product/offer/${offerId}`,
    payload
  );
  return response.data;
};
