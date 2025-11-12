import api from "../../api/axios";

export const searchProducts = async (query) => {
  const response = await api.get(`/api/user/search?query=${query}`);
  return response.data;
};
