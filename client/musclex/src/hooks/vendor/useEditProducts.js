import { useMutation } from "@tanstack/react-query";
import { editProducts } from "../../services/vendor/product";

export const useEditProducts = () => {
  return useMutation({
    mutationFn: editProducts,
  });
};
