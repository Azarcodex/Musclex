import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../../services/user/productFetch";

export const useGetProducts = (
  selectedCategory,
  selectedBrands,
  priceRange,
  selectedRatings,
  sortValue,
  discountValue
) => {
  return useQuery({
    queryKey: [
      "products",
      selectedCategory,
      selectedBrands,
      priceRange,
      selectedRatings,
      sortValue,
      discountValue,
    ],
    queryFn: () =>
      getProducts(
        selectedCategory,
        selectedBrands,
        priceRange,
        selectedRatings,
        sortValue,
        discountValue
      ),
    keepPreviousData: true,
  });
};
