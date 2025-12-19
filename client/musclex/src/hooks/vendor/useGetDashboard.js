import { useQuery } from "@tanstack/react-query";
import { vendorDashboard } from "../../services/vendor/dashboard";

export const useGetVendorDashboard = () => {
  return useQuery({
    queryKey: ["vendor-dash"],
    queryFn: vendorDashboard,
  });
};
