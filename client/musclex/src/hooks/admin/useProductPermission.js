import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ProductPermission } from "../../services/admin/adminService";
import { toast } from "sonner";

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
