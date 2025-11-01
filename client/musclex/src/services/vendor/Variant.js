import api from "../../api/axios";

// ✅ Add variant (with multiple images)
export const addVariant = async (data) => {
  const formData = new FormData();
  Object.keys(data).forEach((key) => {
    if (key === "images") {
      for (let i = 0; i < data.images.length; i++) {
        formData.append("images", data.images[i]);
      }
    } else {
      formData.append(key, data[key]);
    }
  });
// router.post("/variant/add", upload.array("images", 5),addVariant );
  const res = await api.post("api/vendor/variant/add", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
};


// ✅ Get variants by productId
export const getVariantsByProduct = async (productId) => {
  const res = await api.get(`api/vendor/variant/${productId}`);
  return res.data.variants;
};

