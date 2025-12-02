import { useQuery } from "@tanstack/react-query";
import { getWallets } from "../../services/user/wallets";

export const useGetWallets = () => {
  return useQuery({
    queryKey: ["wallet"],
    queryFn: getWallets,
  });
};
