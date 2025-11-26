import { toast } from "sonner";
import { addCoupon, getCoupons, toggleCouponStatus, updateCoupon } from "../../services/admin/couponService";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addCoupon,
    onSuccess: () => {
      queryClient.invalidateQueries(["coupons"]);
    },
  });
};

export const useGetCoupons = () => {
  return useQuery({
    queryKey: ["coupons"],
    queryFn: getCoupons,
  });
};

export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateCoupon,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["coupons"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update coupon");
    },
  });
};

export const useToggleCouponStatus = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: toggleCouponStatus,
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["coupons"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to update status");
    },
  });
};
