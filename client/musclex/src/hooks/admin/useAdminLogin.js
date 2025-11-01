import { useMutation } from "@tanstack/react-query";
import { setAuthtoken } from "../../api/axios.js";
import { loginAdmin } from "../../services/admin/authService.js";
import { replace, useNavigate } from "react-router-dom";
import { toast } from "sonner";
// import loginAdmin from '../services/authService.js'
export const useAdminLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: loginAdmin,
    onSuccess: (data) => {
      console.log(data);
      if (data?.token) {
        setAuthtoken(data.token, data.admin.role);
        navigate("/admin/dashboard", { replace: true });
      }
    },
    onError: (err) => {
      console.log(err)
      toast.error(err.response.data.message);
    },
  });
};
