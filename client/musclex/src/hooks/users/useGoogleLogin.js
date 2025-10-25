import { useMutation } from "@tanstack/react-query";
import { googleLogin } from "../../services/userAuthService";

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: googleLogin,
  });
};
