import { useMutation } from "@tanstack/react-query";
import { applyCoupon } from "../../services/user/coupon.js";

export const useApplyCoupon = () => {
  return useMutation({
    mutationFn: applyCoupon,
  });
};
