import { useMutation } from "@tanstack/react-query";
import { vendorLogin } from "../../services/vendorAuthService.js";
import { setAuthtoken } from "../../api/axios.js";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export const useVendorLogin = () => {
  const navigate = useNavigate();
  return useMutation({
    mutationFn: vendorLogin,
    onSuccess: (data) => {
      console.log(data);
      console.log(data.token);
      if (data?.token) {
        setAuthtoken(data.token);
        localStorage.setItem("vendorToken", data.token);
        toast.success(`${data.message}`);
        navigate("/vendor/dashboard");
      } else {
        toast.error(`${data.message}`);
      }
    },
  });
};
