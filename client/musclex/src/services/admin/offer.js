import api from "../../api/axios";

export const createOffer = async (data) => {
  const response = await api.post("/api/admin/offer/category", data);
  return response.data;
};

export const getOffers = async () => {
  const response = await api.get("/api/admin/offers");
  return response.data;
};

//update
export const updateOffers = async ({ offerId, data }) => {
  console.log(offerId, data);
  const response = await api.patch(`/api/admin/offer/${offerId}`, { data });
  return response.data;
};

//visibility
export const visibilityOffers = async (offerId) => {
  const response = await api.patch(`/api/admin/offer/visibility/${offerId}`);
  return response.data;
};
