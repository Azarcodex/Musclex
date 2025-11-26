import api from "../../api/axios";

export const fetchBrand = async () => {
  const response = await api.get("/api/vendor/brand");
  return response.data;
};

export const fetchUserBrand=async()=>
{
  const response=await api.get("/api/user/brand")
  return response.data
}
