import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  cancelOrder,
  cancelProductOrder,
  deleteTempOrder,
  fetchOrderTracking,
  getOrderList,
  orderSummary,
  placeOrder,
  returnOrder,
} from "../../services/user/Order";

export const useOrder = () => {
  const queryKey = useQueryClient();
  return useMutation({
    mutationFn: placeOrder,
    onSuccess: () => {
      queryKey.invalidateQueries(["summary"]);
    },
  });
};

//summary
export const useGetOrderSummary = (id) => {
  return useQuery({
    queryKey: "summary",
    queryFn: () => orderSummary(id),
  });
};

//orderList
export const usegetOrderLists = () => {
  return useQuery({
    queryKey: ["userOrders"],
    queryFn: getOrderList,
  });
};

//tracking data
export const usegetOrderTrack = (id) => {
  return useQuery({
    queryKey: ["orderTrack"],
    queryFn: () => fetchOrderTracking(id),
  });
};

//cancel order
export const useCancelOrder = () => {
  const queryClient = useQueryClient();
  {
    return useMutation({
      mutationFn: cancelOrder,
      onSuccess: () => {
        queryClient.invalidateQueries(["userOrders"]);
      },
    });
  }
};

//cancel product order
export const useCancelProductOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cancelProductOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["userOrders"]);
    },
  });
};

//return order
export const useReturnOrder = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: returnOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["userOrders"]);
    },
  });
};

export const useDeleteTempOrder = () => {
  return useMutation({
    mutationFn: deleteTempOrder,
  });
};
