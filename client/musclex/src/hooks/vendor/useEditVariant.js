import { useMutation } from "@tanstack/react-query";
import { variantEdit } from "../../services/vendor/Variant";

export const useEditVariant = () => {
  return useMutation({
    mutationFn: variantEdit,
  });
};
