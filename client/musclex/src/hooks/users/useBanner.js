import { useQuery } from "@tanstack/react-query";
import { getActiveBanners } from "../../services/user/homebanner";

export const useGetBanners = () => {
  return useQuery({
    queryKey: ["banner-home"],
    queryFn: getActiveBanners,
  });
};
