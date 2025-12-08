import { useQuery } from "@tanstack/react-query";
import { getCategoryAdmin } from "../../services/admin/adminService";

export const usegetAllCategory = () => {
  return useQuery({
    queryKey: ["category"],
    queryFn: getCategoryAdmin,
    staleTime: 0, 
    refetchOnMount: true, 
    refetchOnWindowFocus: false,
  });
};
