import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AddtoCart,
  AddToCartFromWishList,
  getCart,
  QuantityChange,
  removeFromCart,
  validateCart,
} from "../../services/user/Cart";
import { toast } from "sonner";
export const useAddToCart = () => {
  return useMutation({
    mutationFn: AddtoCart,
  });
};
//get cart
export const useGetCart = () => {
  return useQuery({
    queryKey: ["cart"],
    queryFn: getCart,
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    staleTime: 0,
  });
};
//delete
export const useRemoveCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeFromCart,
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
    },
  });
};
//quantitychange
export const useQuantityChange = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, action }) => QuantityChange(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries(["cart"]);
    },
    onError: (err) => {
      toast.error(err.response.data.message);
    },
  });
};

export const useValidateCart = () => {
  return useMutation({
    mutationFn: validateCart,
  });
};

export const useAddCartFromWishList = () => {
  return useMutation({
    mutationFn: AddToCartFromWishList,
  });
};
