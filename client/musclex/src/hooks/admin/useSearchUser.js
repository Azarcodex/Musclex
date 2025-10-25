import { useQuery } from "@tanstack/react-query";
import { SearchUsers } from "../../services/admin/adminService";

export const useSearchUser = (data) => {
  return useQuery({
    queryKey: ["userSearch", data],
    queryFn: () => SearchUsers(data),
    enabled: data!==undefined,
  });
};
