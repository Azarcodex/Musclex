import api from "../../api/axios";

export const addProduct = async (data) => {
  const res = await api.post("/api/vendor/addProduct", data);
  return res.data;
};

export const getProducts = async () => {
  const response = await api.get("/api/vendor/product");
  return response.data;
};

// export const getProducts = async () => {
//   const res = await api.get("/products");
//   return res.data.products;
// };
