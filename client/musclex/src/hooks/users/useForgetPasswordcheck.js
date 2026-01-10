import { useMutation } from "@tanstack/react-query";
import { forgetPasswordCheck, resetPasswordService } from "../../services/userAuthService";

export const useforgetPasswordCheck = () => {
  return useMutation({
    mutationFn: forgetPasswordCheck,
  });
};



export const  useResetPassword=()=>
{
  return useMutation({
    mutationFn:resetPasswordService
  })
}