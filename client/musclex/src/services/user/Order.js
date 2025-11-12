import api from "../../api/axios";

export const placeOrder = async (payload) => {
  const response = await api.post("/api/user/order", payload);
  return response.data;
};
