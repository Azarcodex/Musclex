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

//update product order status
export const updateProductOrderStatus = async ({ orderId, id, status }) => {
  console.log(orderId, id, status);
  const response = await api.patch(
    `/api/vendor/product/status/${orderId}/${id}`,
    { status }
  );
  return response.data;
};

//return status updating
export const updateReturnStatus = async ({
  orderId,
  itemId,
  newStatus,
  vendorReason,
}) => {
  const response = await api.patch(
    `/api/vendor/product/return/status/${orderId}/${itemId}`,
    { newStatus, vendorReason }
  );
  return response.data;
};
