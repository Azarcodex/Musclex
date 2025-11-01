import { useQuery } from "@tanstack/react-query";
import { vendorOwnProducts } from "../../services/admin/adminService";

export const useVendorOwnProducts = (id) => {
  return useQuery({
    queryKey: ["ownProduct",id],
    queryFn: ()=>vendorOwnProducts(id)
  });
};
