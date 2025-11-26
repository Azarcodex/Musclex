import { useQuery } from "@tanstack/react-query";
import { fetchUserBrand } from "../../services/user/BrandFetch";

export const useGetBrands = () => {
  return useQuery({
    queryKey: ["Brand"],
    queryFn: fetchUserBrand,
  });
};
