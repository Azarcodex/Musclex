import axios from "axios";
import { toast } from "sonner";
import { store } from "../store/store";
import { clearServerDown, setServerDown } from "../store/features/apistatusslice";

const api_key = import.meta.env.VITE_API_URL;
// const dispatch = useDispatch();
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
  (response) => {
    // ✅ Backend is reachable → clear server-down state
    store.dispatch(clearServerDown());
    return response;
  },
  (error) => {
    // 🔴 SERVER DOWN (backend off / network error)
    if (!error.response) {
      store.dispatch(setServerDown());
      error.code = "SERVER_DOWN";
      return Promise.reject(error);
    }

    const status = error.response.status;

    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      "Something went wrong";

    error.message = message;

    // 🔐 BLOCKED USER
    if (status === 403) {
      localStorage.removeItem("user");
      window.location.href = "/user/login";
      toast.error("Your account has been blocked.");
    }

    // 🔥 SERVER ERROR (500+)
    if (status >= 500) {
      store.dispatch(setServerDown());
      error.code = "SERVER_ERROR";
    }

    return Promise.reject(error);
  }
);

export default api;
