import { useQuery } from "@tanstack/react-query";
import { fetchVendors } from "../../services/admin/adminService";

export const useGetVendors = (page) => {
  return useQuery({
    queryKey: ["vendors", page],
    queryFn: () => fetchVendors({page}),
    keepPreviousData: true,
  });
};
