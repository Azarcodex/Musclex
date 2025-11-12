import api from "../../api/axios";

export const userData = async () => {
  const response = await api.get("/api/user/userdetail");
  return response.data;
};

//edit name
export const updateuserName = async (id, data) => {
  console.log(id, data);
  const response = await api.patch("/api/user/userEdit", id, data);
  return response.data;
};
