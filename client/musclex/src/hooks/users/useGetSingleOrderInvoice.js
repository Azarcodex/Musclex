import { useQuery } from "@tanstack/react-query";
import api from "../../api/axios";

export const useGetSingleOrder = (orderId) => {
  return useQuery({
    queryKey: ["single-order", orderId],
    queryFn: async () => {
      const { data } = await api.get(`/api/user/orders/${orderId}`);
      return data;
    },
    enabled: !!orderId,
  });
};
