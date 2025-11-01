import { useMutation } from "@tanstack/react-query";
import { editBrand } from "../../services/vendor/brand";

export const useEditBrand = () => {
  return useMutation({
    mutationFn: editBrand,
  });
};
