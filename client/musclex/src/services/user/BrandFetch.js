import api from "../../api/axios";

export const fetchBrand = async () => {
  const response = await api.get("/api/user/brand");
  return response.data;
};
