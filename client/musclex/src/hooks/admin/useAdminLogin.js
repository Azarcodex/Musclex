import { useMutation } from "@tanstack/react-query";
import { setAuthtoken } from "../../api/axios.js";
import { loginAdmin } from "../../services/admin/authService.js";
import { replace, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setAdminToken } from "../../store/features/adminSlice.js";
// import loginAdmin from '../services/authService.js'
export const useAdminLogin = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      // console.log(data);
      if (data?.token) {
        setAuthtoken(data.token);
        dispatch(setAdminToken(data?.token));
        navigate("/admin/dashboard/analytics", { replace: true });
      }
    },
    onError: (err) => {
      console.log(err);
      toast.error(err.response.data.message);
    },
  });
};
