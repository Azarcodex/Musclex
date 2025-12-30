import { useMutation } from "@tanstack/react-query";
import {
  enableOTP,
  resendOTP,
  resendOTPForgetPassword,
} from "../../services/userAuthService";

export const useOTP = () => {
  return useMutation({
    mutationFn: enableOTP,
  });
};
//resend OTP
export const useResendOTP = () => {
  return useMutation({
    mutationFn: resendOTP,
  });
};

export const useResendOTPForgetPassword = () => {
  return useMutation({
    mutationFn: resendOTPForgetPassword,
  });
};
