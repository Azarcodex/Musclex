import { useMutation } from "@tanstack/react-query";
import { editCategory } from "../../services/vendor/category";

export const useEditCategory = () => {
  return useMutation({
    mutationFn: editCategory
  });
};
