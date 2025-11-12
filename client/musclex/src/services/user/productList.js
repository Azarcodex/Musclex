import api from "../../api/axios";

export const productListings = async ({ id }) => {
  const response = await api.get(`/api/user/product/${id}`);
  return response.data;
};
