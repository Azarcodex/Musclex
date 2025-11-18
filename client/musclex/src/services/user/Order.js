import api from "../../api/axios";

export const placeOrder = async (payload) => {
  const response = await api.post("/api/user/order", payload);
  return response.data;
};

export const orderSummary = async (id) => {
  const response = await api.get(`/api/user/order/summary/${id}`);
  return response.data;
};

//orderList
export const getOrderList = async () => {
  const response = await api.get("/api/user/orderList");
  return response.data;
};
//track orders
export const fetchOrderTracking = async (id) => {
  const response = await api.get(`api/user/orderList/${id.orderId}`);
  return response.data;
};

//cancel orders
export const cancelOrder = async (id) => {
  // console.log(id)
  const response = await api.patch(`/api/user/order/cancel/${id}`);
  return response.data;
};
