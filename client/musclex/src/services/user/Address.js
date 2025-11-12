import { patch } from "@mui/material";
import api from "../../api/axios";

//fetch
export const fetchAddresses = async () => {
  const response = await api.get("/api/user/address");
  return response.data.addresses;
};

// Add new address
export const addAddress = async (payload) => {
  const response = await api.post("/api/user/address", payload);
  return response.data;
};
//edit
export const EditAddress = async ({ id, data }) => {
  const response = await api.patch(`/api/user/address/${id}`, data);
  return response.data;
};

export const DeleteAddress = async (id) => {
  const response = await api.delete(`/api/user/address/${id}`);
  return response.data;
};

export const defaultAddress = async (id) => {
  const response = await api.patch(`/api/user/address/default/${id}`);
  return response.data;
};
