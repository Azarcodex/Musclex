import api from "../api/axios";

export const Regisration = async (data) => {
  const response = await api.post("/api/user/register", data);
  return response.data;
};
//otp setUp
export const enableOTP = async (data) => {
  const response = await api.post("/api/user/verify", data);
  return response.data;
};
//loginSetup
export const loginUser = async (data) => {
  const response = await api.post("/api/user/login", data);
  return response.data;
};
//resendOTP
export const resendOTP = async (data) => {
  const response = await api.post("/api/user/resend", data);
  return response.data;
};

//googleLogin
export const googleLogin = async (token) => {
  const response = await api.post("/api/auth/google", { token });
  return response.data;
};
//forget password
export const forgetPassword = async (data) => {
  const response = await api.post("/api/user/forget", data);
  return response.data;
};
//forget password check
export const forgetPasswordCheck = async (data) => {
  const response = await api.post("/api/user/forgetCheck", data);
  return response.data;
};

export const resetPasswordService = async (payload) => {
  const response = await api.post("/api/user/reset", payload);
  return response.data;
};
