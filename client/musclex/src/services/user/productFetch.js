






// export const getProducts = async (
//   selectedCategory,
//   selectedBrands,
//   priceRange,
//   selectedRatings,
//   sortValue,
//   discountValue
// ) => {
//   const params = {};
//   if (selectedCategory.length > 0) {
//     params.categories = selectedCategory.join(",");
//   }
//   if (selectedBrands.length > 0) {
//     params.brands = selectedBrands.join(",");
//   }
//   if (priceRange && priceRange.length === 2) {
//     params.minPrice = priceRange[0];
//     params.maxPrice = priceRange[1];
//     // console.log(typeof params.minPrice);
//     // console.log(params.maxPrice);
//   }
//   if (selectedRatings.length > 0) {
//     params.rating = selectedRatings.join(",");
//   }
//   if (sortValue) {
//     params.sortMode = sortValue;
//   }
//   if (discountValue) {
//     params.discountfav = discountValue;
//   }
//   const response = await api.get("/api/user/products/", { params });
//   console.log(response.data)
//   return response.data;
// };

