import api from "../api/axios";

export const vendorRegistration = async (data) => {
  const response = await api.post("/api/vendor/register", data);
  return response.data;
};
//login setUp
export const vendorLogin = async (data) => {
  const response = await api.post("/api/vendor/login", data);
  return response.data;
};
