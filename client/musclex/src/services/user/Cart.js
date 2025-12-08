import api from "../../api/axios";
export const AddtoCart = async (data) => {
  const response = await api.post("/api/user/addtocart", data);
  return response.data;
};

export const getCart = async () => {
  const response = await api.get("/api/user/getcart");
  return response.data;
};

//delete cart
export const removeFromCart = async (id) => {
  const response = await api.delete(`/api/user/cart/${id}`);
  return response.data;
};

export const QuantityChange = async (id, action) => {
  const response = await api.patch(`/api/user/quantity/${id}`, { action });
  console.log(response.data);
  return response.data;
};

export const validateCart = async () => {
  const response = await api.get("/api/user/cart/validate");
  return response.data;
};
