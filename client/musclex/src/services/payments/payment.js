import api from "../../api/axios";

export const CreateWalletOrder = async (amount) => {
  console.log(amount);
  const response = await api.post(
    "/api/payments/user/wallet/create-order",
    amount
  );
  // console.log(response.data);
  return response.data;
};

export const verifyPayment = async (payload) => {
  console.log(payload);
  const response = await api.post("/api/payments/wallet/verify", payload);
  console.log(response.data);
  return response.data;
};



// 1️ Create Razorpay Order + TempOrder
export const createRazorpayOrderService = async (payload) => {
  const res = await api.post("/api/payments/create-razorpay-order", payload);
  return res.data;
};

// 2️ Verify First Payment Attempt
export const verifyPaymentService = async (payload) => {
  const res = await api.post("/api/payments/verify-payment", payload);
  return res.data;
};

// 3️Retry Payment → Create NEW Razorpay Order
export const retryPaymentService = async (tempOrderId) => {
  const res = await api.post(`/api/payments/retry/${tempOrderId}`);
  return res.data;
};

// 4️ Verify Retry Payment
export const verifyRetryPaymentService = async (payload) => {
  const res = await api.post("/api/payments/verify-retry", payload);
  return res.data;
};

// 5️ Get Temp Order on Failure Page
export const getTempOrderService = async (tempOrderId) => {
  const res = await api.get(`/api/payments/temporder/${tempOrderId}`);
  return res.data;
};
