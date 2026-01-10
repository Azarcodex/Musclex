import { useQuery } from "@tanstack/react-query";
import {
  featuredProductsDisplay,
  productListings,
} from "../../services/user/productList";

export const useProductListings = (id) => {
  return useQuery({
    queryKey: ["productList", id],
    queryFn: () => productListings({ id }),
  });
};

export const usegetFeaturedProducts = () => {
  return useQuery({
    queryKey: ["featured"],
    queryFn: featuredProductsDisplay,
  });
};
