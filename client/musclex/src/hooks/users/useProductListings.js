import { useQuery } from "@tanstack/react-query";
import { productListings } from "../../services/user/productList";

export const useProductListings = (id) => {
  return useQuery({
    queryKey: ["productList",id],
    queryFn: ()=>productListings({id})
  });
};
