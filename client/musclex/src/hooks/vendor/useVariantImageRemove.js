import { useMutation } from "@tanstack/react-query";
import { variantImageRemove } from "../../services/vendor/Variant";

export const useVariantImageRemove = () => {
  return useMutation({
    mutationFn: variantImageRemove,
  });
};
