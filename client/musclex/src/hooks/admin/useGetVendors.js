import { useQuery } from "@tanstack/react-query";
import { fetchVendors } from "../../services/admin/adminService";

export const useGetVendors = (page, search, statusFilter) => {
  return useQuery({
    queryKey: ["vendors", page, search, statusFilter],
    queryFn: () => fetchVendors({ page, search, statusFilter }),
    keepPreviousData: true,
  });
};
