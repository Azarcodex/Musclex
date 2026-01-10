import api from "../../api/axios";

export const ToggleProductActivation = async (id) => {
  const response = await api.patch(`/api/admin/product/${id}`);
  return response.data;
};

export const featureProductControl = async (id) => {
  const response = await api.patch(`/api/admin/product/feature/${id}`);
  return response.data;
};
