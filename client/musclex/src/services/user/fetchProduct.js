import api from "../../api/axios";

export const fetchProducts = async (
  page,
  selectedCategory,
  selectedBrands,
  priceRange,
  selectedRatings,
  sortValue
) => {
  console.log(selectedCategory);
  const params = {};
  params.page = page;
  if (selectedCategory.length > 0) {
    params.category = selectedCategory.join(",");
  }
  if (selectedBrands.length > 0) {
    params.brands = selectedBrands.join(",");
  }
  if (priceRange && priceRange.length === 2) {
    params.minPrice = priceRange[0];
    params.maxPrice = priceRange[1];
  }
  if (selectedRatings && selectedRatings.length > 0) {
    params.rating = selectedRatings.join(",");
  }
  if (sortValue) {
    params.sortValue = sortValue;
  }
  const response = await api.get(`/api/user/products/`, { params });
  return response.data;
};
