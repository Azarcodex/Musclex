import { useQuery } from "@tanstack/react-query";
import { searchProducts } from "../../services/user/searchProduct";

export const useSearch = (query) => {
  return useQuery({
    queryKey: ["search", query],
    queryFn: () => searchProducts(query),
  });
};
