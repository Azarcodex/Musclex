import { useQuery } from "@tanstack/react-query";
import { getWishList } from "../../services/user/wishlist";

export const usegetWishList = () => {
  return useQuery({
    queryKey: ["wishList"],
    queryFn: getWishList,
  });
};
