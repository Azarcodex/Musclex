import { useMutation } from "@tanstack/react-query";
import { placeOrder } from "../../services/user/Order";

export const useOrder = () => {
  return useMutation({
    mutationFn: placeOrder,
  });
};
