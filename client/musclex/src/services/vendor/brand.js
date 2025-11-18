import api from "../../api/axios";

export const postBrand = async (data) => {
  const response = await api.post("/api/vendor/brand/add", data);
  return response.data;
};
export const getBrands = async () => {
  const response = await api.get("/api/vendor/brand");
  return response.data;
};

export const deleteBrand = async ({ id }) => {
  const response = await api.delete(`/api/vendor/brand/${id}`);
  return response.data;
};

export const editBrand = async ({ id, data }) => {
  const response = await api.patch(`/api/vendor/brand/update/${id}`, data);
  return response.data;
};

//visibility
export const brandVisibility = async (id) => {
  const response = await api.patch(`/api/vendor/brand/visible/${id}`);
  return response.data;
};
