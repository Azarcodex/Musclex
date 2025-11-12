import api from "../../api/axios";

export const addProduct = async (data) => {
  const res = await api.post("/api/vendor/addProduct", data);
  return res.data;
};

export const getProducts = async ({ page }) => {
  const response = await api.get(`/api/vendor/product?page=${page}`);
  return response.data;
};

export const editProducts = async ({ id, data }) => {
  const response = await api.patch(`/api/vendor/editProduct/${id}`, data);
  return response.data;
};
export const productVisibility = async ({ id }) => {
  const response = await api.patch(`/api/vendor/visible/${id}`);
  return response.data;
};
export const productDelete = async ({ id }) => {
  const response = await api.delete(`/api/vendor/delete/${id}`);
  return response.data;
};
