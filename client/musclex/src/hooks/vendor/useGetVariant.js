// src/hooks/useGetVariants.js
import { useQuery } from "@tanstack/react-query";
import { getVariantsByProduct } from "../../services/vendor/Variant";

export const useGetVariants = (productId) => {
  return useQuery({
    queryKey: ["variants", productId],
    queryFn: () => getVariantsByProduct(productId),
    enabled: !!productId,
  });
};
