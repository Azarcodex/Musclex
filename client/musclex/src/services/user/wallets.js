import api from "../../api/axios";

export const getWallets = async () => {
  const response = await api.get("/api/user/wallet");
  return response.data;
};
