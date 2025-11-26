import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrderList,
  updateOrderStatus,
  updateProductOrderStatus,
  updateReturnStatus,
} from "../../services/vendor/Order";
import { toast } from "sonner";

export const useGetOrdersList = () => {
  return useQuery({
    queryKey: ["orders"],
    queryFn: getOrderList,
  });
};
//update status
export const useUpdateStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });
};

//update product status
export const useUpdateProductStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProductOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });
};

//return order
export const useReturnOrderStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateReturnStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(["orders"]);
    },
  });
};
