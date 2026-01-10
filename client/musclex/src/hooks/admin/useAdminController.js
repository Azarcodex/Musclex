import { useMutation } from "@tanstack/react-query";
import { categoryController } from "../../services/admin/adminService";

export const useAdminController = (id) => {
  return useMutation({
    mutationFn: () => categoryController(id),
  });
};
