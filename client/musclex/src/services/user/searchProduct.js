import api from "../../api/axios";

export const searchProducts = async (query) => {
  const response = await api.get(`/api/user/search?query=${query}`);
//   console.log(response.data);
  return response.data;
};
