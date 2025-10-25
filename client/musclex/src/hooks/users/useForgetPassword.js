import { useMutation } from "@tanstack/react-query";
import { forgetPassword } from "../../services/userAuthService";

export const useForgetPassword = () => {
  return useMutation({
    mutationFn: forgetPassword,
  });
};
