import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../services/userAuthService.js";
import { setAuthtoken } from "../../api/axios.js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { userAuthStore } from "./zustand/useAuth.js";

export const useUserLogin = () => {
  const { setToken } = userAuthStore();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.token) {
        setAuthtoken(data.token, data.user.role);
        setToken(data.token);
        navigate("/");
      }
    },
    onError: (error) => {
      toast.error(`${error.response.data.message}`);
    },
  });
};
