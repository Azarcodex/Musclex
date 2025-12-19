import api from "../../api/axios";

export const getActiveBanners = async () => {
  const response = await api.get("/api/user/slides");
  return response.data;
};
