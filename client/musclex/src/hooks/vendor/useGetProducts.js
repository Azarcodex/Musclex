import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../services/vendor/product";

export const useGetProducts = (page, debounce) => {
  return useQuery({
    queryKey: ["products", page, debounce],
    queryFn: () => getProducts({ page, debounce }),
  });
};
