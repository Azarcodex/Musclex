import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { addProduct } from "../../services/vendor/product";

export const useAddProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addProduct,
    onSuccess: () => {
      toast.success("Product added successfully!");
    //   queryClient.invalidateQueries(["products"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to add product");
    },
  });
};
