import { useMutation, useQueryClient } from "@tanstack/react-query";
import { UpdateStatusVendors } from "../../services/admin/adminService";
import { toast } from "sonner";

export const useStatusVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: UpdateStatusVendors,
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
