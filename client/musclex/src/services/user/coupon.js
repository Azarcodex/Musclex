import api from "../../api/axios";


// Apply coupon for user
export const applyCoupon = async (payload) => {
  const res = await api.post("/api/user/coupon/apply", payload);
  return res.data;
};
