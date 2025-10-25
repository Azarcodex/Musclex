import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../services/userAuthService.js";
import { setAuthtoken } from "../../api/axios.js";
import { useNavigate } from "react-router-dom";

export const useUserLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      if (data?.token) {
        setAuthtoken(data.token);
        navigate("/user/demo");
      }
    },
  });
};
