import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandVisibility, getBrands } from "../../services/vendor/brand";

export const useGetBrands = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrands,
  });
};

//visibility
export const useVisibleBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: brandVisibility,
    onSuccess: () => {
      queryClient.invalidateQueries(["brands"]);
    },
  });
};
