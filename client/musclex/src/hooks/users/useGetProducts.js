import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../services/user/productFetch";

export const useGetProducts = (
  selectedCategory,
  selectedBrands,
  priceRange,
  selectedRatings,
sortValue
) => {
  return useQuery({
    queryKey: ["products", selectedCategory, selectedBrands, priceRange,selectedRatings,sortValue],
    queryFn: () =>
      getProducts(
        selectedCategory,
        selectedBrands,
        priceRange,
        selectedRatings,
      sortValue
      ),
    keepPreviousData: true,
  });
};
