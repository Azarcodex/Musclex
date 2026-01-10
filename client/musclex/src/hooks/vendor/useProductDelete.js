import { useMutation } from "@tanstack/react-query";
import { productDelete } from "../../services/vendor/product";

export const useProductDelete = () => {
  return useMutation({
    mutationFn: productDelete,
  });
};
