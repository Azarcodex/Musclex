import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getOrderList, updateOrderStatus } from "../../services/vendor/Order";

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
