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

//update password
export const changePassword = async (payload) => {
  // console.log(payload);
  const response = await api.patch("/api/user/changePassword", payload);
  return response.data;
};
//upload image
export const uploadImage = async (formdata) => {
  console.log(formdata);
  const response = await api.put(`/api/user/profile/image`, formdata, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const removeProfileImageService = async () => {
  const response = await api.delete("/api/user/profile/image");
  return response.data;
};
