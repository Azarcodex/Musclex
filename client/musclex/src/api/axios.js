import axios from "axios";

const api_key = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: api_key,
});
export const setAuthtoken = (token) => {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
    localStorage.setItem("admin_token", token);
  } else {
    delete api.defaults.headers.common.Authorization;
    localStorage.removeItem("admin_token");
  }
};

export default api;
