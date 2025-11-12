import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../../services/user/fetchProduct";

export const useProductFetch = (
  selectedCategory,
  selectedBrands,
  priceRange,
  selectedRatings,
  sortValue
) => {
  return useQuery({
    queryKey: [
      "products",
      selectedCategory,
      selectedBrands,
      priceRange,
      selectedRatings,
      sortValue
    ],
    queryFn: () =>
      fetchProducts(
        selectedCategory,
        selectedBrands,
        priceRange,
        selectedRatings,
        sortValue
      ),
  });
};
