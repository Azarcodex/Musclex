import api from "../../api/axios";

export const CreateWalletOrder = async (amount) => {
  console.log(amount);
  const response = await api.post("/api/payment/wallet/create-order", amount);
  console.log(response.data);
  return response.data;
};

export const verifyPayment = async (payload) => {
  console.log(payload);
  const response = await api.post("/api/payment/wallet/verify", payload);
  console.log(response.data);
  return response.data;
};

//when ordering
export const createRazorpayOrderService = async (amount) => {
  // send { amount } in rupees (number)
  const res = await api.post("/api/payments/create-order", { amount });
  return res.data;
};

export const verifyPaymentService = async (payload) => {
  console.log(payload);
  const res = await api.post("/api/payments/verify", payload);
  return res.data;
};
