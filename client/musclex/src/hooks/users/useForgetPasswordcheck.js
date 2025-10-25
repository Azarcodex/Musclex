import { useMutation } from "@tanstack/react-query";
import { forgetPasswordCheck } from "../../services/userAuthService";

export const useforgetPasswordCheck = () => {
  return useMutation({
    mutationFn: forgetPasswordCheck,
  });
};
