import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../services/vendor/product";

export const useGetProducts = (page) => {
  return useQuery({
    queryKey: ["products", page],
    queryFn: () => getProducts({ page }),
  });
};
