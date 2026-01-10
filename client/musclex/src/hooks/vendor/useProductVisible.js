import { useMutation } from "@tanstack/react-query";
import { productVisibility } from "../../services/vendor/product";

export const useProductVisible = () => {
  return useMutation({
    mutationFn: productVisibility,
  });
};
