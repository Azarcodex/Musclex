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
  } else if (config.url?.includes("/payment")) {
    config.headers.Authorization = `Bearer ${user_token}`;
  } else if (config.url?.includes("/vendor/wallet")) {
    config.headers.Authorization = `Bearer ${vendor_token}`;
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.message ||
      error?.response?.data?.error ||
      "Something went wrong";

    const status = error?.response?.status;

    // Normalize error object
    error.message = message;

    // BLOCKED USER HANDLING (already done by you)
    if (status === 403) {
      localStorage.removeItem("user");
      window.location.href = "/user/login";
      toast.error("Your account has been blocked.");
    }

    // Unauthorized token expired
    // if (status === 401) {
    //   localStorage.removeItem("user");
    //   localStorage.removeItem("vendor");
    //   localStorage.removeItem("admin");

    //   toast.error("Session expired. Please login again.");

    //   window.location.href = "/user/login";
    // }

    // if (status === 400) {
    //   toast.error(message);
    // }

    // Internal server errors
    if (status >= 500) {
      toast.error("Error occurred");
    }

    return Promise.reject(error);
  }
);

export default api;
