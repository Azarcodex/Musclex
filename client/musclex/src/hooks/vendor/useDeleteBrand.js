import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteBrand } from "../../services/vendor/brand";
import { toast } from "sonner";
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: (data) => {
      toast.success(`${data.message}`);
      queryClient.invalidateQueries(["brands"]);
    },
  });
};
