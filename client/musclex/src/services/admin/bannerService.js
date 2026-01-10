import api from "../../api/axios";

export const postBanner = async (payload) => {
  const response = await api.post("/api/admin/banners", payload);
  return response.data;
};

export const getBanners = async () => {
  const response = await api.get("/api/admin/banners");
  console.log(response.data);
  return response.data;
};

export const updateBanners = async ({id, payload}) => {
  console.log(id, payload);
  const response = await api.patch(`/api/admin/banners/${id}`, payload, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};
