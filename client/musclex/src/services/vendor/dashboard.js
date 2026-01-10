import api from "../../api/axios";

export const vendorDashboard = async () => {
  const response = await api.get("/api/vendor/dashboard");
  return response.data;
};
