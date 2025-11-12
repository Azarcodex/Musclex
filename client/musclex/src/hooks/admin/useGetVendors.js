import { useQuery } from "@tanstack/react-query";
import { fetchVendors } from "../../services/admin/adminService";

export const useGetVendors = (page, search) => {
  return useQuery({
    queryKey: ["vendors", page, search],
    queryFn: () => fetchVendors({ page, search }),
    keepPreviousData: true,
  });
};
