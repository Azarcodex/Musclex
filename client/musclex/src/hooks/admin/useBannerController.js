import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBanners,
  postBanner,
  updateBanners,
} from "../../services/admin/bannerService";

export const useAddBanner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: postBanner,
    onSuccess: () => {
      queryClient.invalidateQueries(["banners"]);
    },
  });
};

export const useGetBanners = () => {
  return useQuery({
    queryKey: ["banners"],
    queryFn: getBanners,
  });
};

export const useUpdateBanners = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateBanners,
    onSuccess: () => {
      queryClient.invalidateQueries(["banners"]);
    },
  });
};
