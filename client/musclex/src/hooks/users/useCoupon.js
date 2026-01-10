import { useMutation, useQuery } from "@tanstack/react-query";
import { applyCoupon, getCoupons } from "../../services/user/coupon.js";

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: applyCoupon,
  });
};

export const usegetAvailableCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: getCoupons,
  });
};
