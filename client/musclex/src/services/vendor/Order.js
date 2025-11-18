import api from "../../api/axios";

export const getOrderList = async () => {
  const response = await api.get("/api/vendor/orderList");
  return response.data;
};
//update order status
export const updateOrderStatus = async ({ id, status }) => {
  const response = await api.patch(`/api/vendor/updatestatus/${id}`, {
    status,
  });
  return response.data;
};
