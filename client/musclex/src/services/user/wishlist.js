import api from "../../api/axios";

export const addWishList = async ({ productId, variantId, sizeLabel }) => {
  // console.log(productId, variantId);
  const response = await api.post("/api/user/wishList", {
    productId,
    variantId,
    sizeLabel,
  });
  // console.log("✅✅✅✅" + response.data);
  return response.data;
};

export const removeWishList = async ({ id }) => {
  const response = await api.delete(`/api/user/wishList/${id}`);
  return response.data;
};
//get wishList
export const getWishList = async () => {
  const response = await api.get("/api/user/wishList");
  return response.data;
};
