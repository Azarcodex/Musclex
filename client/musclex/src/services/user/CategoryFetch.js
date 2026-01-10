import api from "../../api/axios";

export const CategoryFetch = async () => {
  const response = await api.get("api/user/categories");
  return response.data;
};
