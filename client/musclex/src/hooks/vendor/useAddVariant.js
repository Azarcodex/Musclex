// src/hooks/useAddVariant.js
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { addVariant } from "../../services/vendor/Variant";

export const useAddVariant = () => {
  return useMutation({
    mutationFn: addVariant,
  });
};
