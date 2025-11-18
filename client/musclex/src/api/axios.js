import axios from "axios";
import { toast } from "sonner";

const api_key = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: api_key,
});
export const setAuthtoken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    // localStorage.setItem(role, token);
  } else {
    delete api.defaults.headers.common.Authorization;
    // localStorage.removeItem(`${role}`);
  }
};

//axios Interceptor
api.interceptors.request.use((config) => {
  const admin_token = localStorage.getItem("admin");
  const user_token = localStorage.getItem("user");
  const vendor_token = localStorage.getItem("vendor");
  if (config.url?.includes("/admin") && admin_token) {
    config.headers.Authorization = `Bearer ${admin_token}`;
  } else if (config.url?.includes("/vendor") && vendor_token) {
    config.headers.Authorization = `Bearer ${vendor_token}`;
  } else if (config.url?.includes("/user") && user_token) {
    config.headers.Authorization = `Bearer ${user_token}`;
  }
  return config;
});

//
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;

    // IF ADMIN BLOCKED USER
    if (status === 403) {
      localStorage.removeItem("user");

      window.location.href = "/user/login";

      toast.error("Your account has been blocked.");
    }

    return Promise.reject(error);
  }
);

export default api;
