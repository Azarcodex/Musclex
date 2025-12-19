import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductPermission } from "../../services/admin/adminService";
import { toast } from "sonner";
import { featureProductControl } from "../../services/admin/product";

export const useProductPermission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ProductPermission,
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`${data.message}`);
        queryClient.invalidateQueries(["vendors"]);
      } else {
        toast.error(`${data.message}`);
      }
    },
  });
};

export const useControlProductFeature = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: featureProductControl,
    onSuccess: () => {
      queryClient.invalidateQueries(["vendors"]);
    },
  });
};
