import { useMutation } from "@tanstack/react-query";
import { addCategory } from "../../services/vendor/category";

export const useAddCategory = () => {
  return useMutation({
    mutationFn: addCategory
  });
};
