import { useMutation, useQueryClient } from "@tanstack/react-query";
import { VerifyUsers } from "../../services/admin/adminService";
import { toast } from "sonner";

export const useVerifyUser = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: VerifyUsers,
    onSuccess: (data) => {
        console.log(data)
      if (data.success) {
        toast.success(data.message);
        queryClient.invalidateQueries(["users"]);
      } else {
        toast.error(data.message);
      }
    },
  });
};
