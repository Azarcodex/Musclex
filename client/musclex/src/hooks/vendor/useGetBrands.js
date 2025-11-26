import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { brandVisibility, getBrandsVendor } from "../../services/vendor/brand";

export const useGetBrandsVendor = () => {
  return useQuery({
    queryKey: ["brands"],
    queryFn: getBrandsVendor,
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
