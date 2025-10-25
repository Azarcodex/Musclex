import api from "../../api/axios";

export const loginAdmin = async ({ email, password }) => {
  const res = await api.post("/api/admin/login", {
    email: email || "",
    password: password || "",
  });
  return res.data;
};
