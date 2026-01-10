import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createRazorpayOrderService,
  getTempOrderService,
  retryPaymentService,
  verifyPaymentService,
  verifyRetryPaymentService,
} from "../../services/payments/payment";

export const useCreateRazorpayOrder = () => {
  return useMutation({
    mutationFn: createRazorpayOrderService,
  });
};

//  Verify first Razorpay payment
export const useVerifyRazorpayPayment = () => {
  return useMutation({
    mutationFn: verifyPaymentService,
  });
};

//  Retry payment → create NEW Razorpay order
export const useRetryPayment = () => {
  return useMutation({
    mutationFn: retryPaymentService,
  });
};

//  Verify retry payment
export const useVerifyRetryPayment = () => {
  return useMutation({
    mutationFn: verifyRetryPaymentService,
  });
};

//  Fetch TempOrder for failed page
export const useGetTempOrder = (tempOrderId) => {
  return useQuery({
    queryKey: ["tempOrder", tempOrderId],
    queryFn: () => getTempOrderService(tempOrderId),
    enabled: !!tempOrderId,
  });
};
