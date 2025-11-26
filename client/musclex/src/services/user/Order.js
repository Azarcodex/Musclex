import api from "../../api/axios";

export const placeOrder = async (payload) => {
  console.log(payload);
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

//cancel product orders
export const cancelProductOrder = async ({ orderId, item_id }) => {
  const response = await api.patch(
    `/api/user/order/cancel/${orderId}/${item_id}`
  );
  return response.data;
};

//return item
export const returnOrder = async ({ reason, orderId, itemId }) => {
  const response = await api.patch(
    `/api/user/order/return/${orderId}/${itemId}`,
    { reason }
  );
  return response.data;
};
