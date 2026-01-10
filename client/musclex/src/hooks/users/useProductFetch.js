import { useQuery } from "@tanstack/react-query";
import { fetchProducts } from "../../services/user/fetchProduct";

export const useProductFetch = (
  page,
  selectedCategory,
  selectedBrands,
  priceRange,
  selectedRatings,
  sortValue
) => {
  return useQuery({
    queryKey: [
      "products",
      page,
      selectedCategory,
      selectedBrands,
      priceRange,
      selectedRatings,
      sortValue,
    ],
    queryFn: () =>
      fetchProducts(
        page,
        selectedCategory,
        selectedBrands,
        priceRange,
        selectedRatings,
        sortValue
      ),
  });
};
