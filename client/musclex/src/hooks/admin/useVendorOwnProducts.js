import { useQuery } from "@tanstack/react-query";
import { vendorOwnProducts } from "../../services/admin/adminService";

export const useVendorOwnProducts = (id, page, debounce) => {
  return useQuery({
    queryKey: ["ownProduct", id, page, debounce],
    queryFn: () => vendorOwnProducts({ id, page, debounce }),
  });
};
