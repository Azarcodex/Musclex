import { useQuery } from "@tanstack/react-query";
import { fetchUsers } from "../../services/admin/adminService";

export const useGetUsers = (page, search) => {
  return useQuery({
    queryKey: ["users", page, search],
    queryFn: () => fetchUsers({ page, search }),
    keepPreviousData: true,
  });
};
