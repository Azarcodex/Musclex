import { useMutation } from "@tanstack/react-query";
import { loginUser } from "../../services/userAuthService.js";
import { setAuthtoken } from "../../api/axios.js";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setUserAuthToken } from "../../store/features/userSlice.js";
export const useUserLogin = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return useMutation({
    mutationFn: loginUser,
    onSuccess: (data) => {
      console.log(data)
      if (data?.token) {
        setAuthtoken(data?.token);
        dispatch(setUserAuthToken(data?.token));
        navigate("/");
      }
    },
    onError: (error) => {
      toast.error(`${error.response.data.message}`);
    },
  });
};
