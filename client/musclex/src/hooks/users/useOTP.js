import { useMutation } from "@tanstack/react-query";
import { enableOTP, resendOTP } from "../../services/userAuthService";

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
