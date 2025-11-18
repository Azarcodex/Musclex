import api from "../../api/axios";
//for ADMINS
export const addCategory = async (data) => {
  const response = await api.post("/api/admin/category/add", data);
  return response.data;
};

export const getcategory = async () => {
  const response = await api.get("/api/admin/category");
  return response.data;
};

export const editCategory = async ({ id, data }) => {
  console.log(data);
  const response = await api.patch(`/api/admin/category/update/${id}`, data);
  return response.data;
};

// export const controlCategory = async ({ id }) => {
//   const response = await api.patch(`/api/vendor/category/control/${id}`);
//   return response.data;
// };

export const deleteCategory = async ({ id }) => {
  const response = await api.delete(`/api/admin/category/${id}`);
  return response.data;
};

//vendor category
export const getcategoryForVendors = async () => {
  const response = await api.get("/api/vendor/category");
  return response.data;
};
