import api from "../../api/axios.js";

export const addCoupon = async (data) => {
  const res = await api.post("/api/admin/create/coupon", data);
  return res.data;
};

export const getCoupons = async () => {
  const res = await api.get("/api/admin/coupon");
  return res.data;
};

export const updateCoupon = async ({ id, payload }) => {
  console.log(id,payload)
  const response = await api.patch(`/api/admin/coupon/${id}`, payload);
  return response.data;
};

export const toggleCouponStatus = async (id) => {
  const response = await api.patch(`/api/admin/coupon/${id}/status`);
  return response.data;
};
