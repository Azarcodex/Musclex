import api from "../../api/axios";

// Apply coupon for user
export const applyCoupon = async (payload) => {
  const res = await api.post("/api/user/coupon/apply", payload);
  return res.data;
};

//getcoupons
export const getCoupons = async () => {
  const res = await api.get("/api/user/coupons");
  return res.data;
};
