import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "../../services/user/searchProduct";

export const useSearch = (query) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchProducts(query),
    enabled: query.trim().length > 0,
    staleTime: 1000 * 30, // ✅ Cache results for 30 seconds
    gcTime: 1000 * 60 * 5, // ✅ Keep in memory for 5 minutes
    retry: false, // ✅ Don’t auto-retry if empty or fails
  });
};
