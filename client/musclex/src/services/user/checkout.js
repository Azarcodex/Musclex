import api from "../../api/axios";

export const fetchCheckout = async () => {
  const response = await api.get("/api/user/checkout");
  return response.data;
};
