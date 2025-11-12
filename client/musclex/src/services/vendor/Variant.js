import api from "../../api/axios";

// ✅ Add variant (with multiple images)
export const addVariant = async (formdata) => {
  const response = await api.post(`/api/vendor/variant/add`, formdata, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

// ✅ Get variants by productId
export const getVariantsByProduct = async (productId) => {
  const res = await api.get(`api/vendor/variant/${productId}`);
  return res.data.variants;
};

export const productRelatedVariants = async (productId) => {
  const res = await api.get(`/api/vendor/variant/product/${productId}`);
  // console.log(res.data)
  return res.data;
};
//edit the variant
export const variantEdit = async ({ variantId, formdata }) => {
  const res = await api.patch(
    `/api/vendor/variant/edit/${variantId}`,
    formdata,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );
  return res.data;
};
//delete variant image
export const variantImageRemove = async (variantId, src) => {
  const res = await api.delete(`/api/vendor/variant/image`, {
    data: { variantId, src },
  });
  return res.data;
};
