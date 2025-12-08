import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ToggleProductActivation } from "../../services/admin/product";

export const useBlockProduct = () => {
  const querClient = useQueryClient();

  return useMutation({
    mutationFn: ToggleProductActivation,
    onSuccess: () => {
      querClient.invalidateQueries(["ownProduct"]);
    },
  });
};
