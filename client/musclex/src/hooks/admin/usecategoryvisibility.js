import { useMutation } from "@tanstack/react-query";
import { categoryController } from "../../services/admin/adminService";

export const usecategoryvisibility = () => {
  return useMutation({
    mutationFn: categoryController,
  });
};
