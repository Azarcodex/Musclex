import { useQuery } from "@tanstack/react-query";
import { fetchCheckout } from "../../services/user/checkout";

export const useGetCheckout = () => {
  return useQuery({
    queryKey: ["checkout"],
    queryFn: fetchCheckout,
  });
};
