import { create } from "zustand";

export const userAuthStore = create((set, get) => ({
  token: localStorage.getItem("user") || null,
  setToken: (token) => {
    localStorage.setItem("user", token);
    set({ token });
  },
  getToken: () => {
    const token = get().token;
    return token;
  },
  clearToken: () => {
    localStorage.removeItem("user");
    set({ token: null });
  },
}));

//vendor
export const usevendorAuthStore = create((set, get) => ({
  token: localStorage.getItem("vendor") || null,
  getToken: () => {
    const token = get().token;
    return token;
  },
  clearToken: () => {
    localStorage.removeItem("vendor");
    set({ token: null });
  },
}));
