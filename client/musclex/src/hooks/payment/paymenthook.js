import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  createRazorpayOrderService,
  CreateWalletOrder,
  verifyPayment,
  verifyPaymentService,
} from "../../services/payments/payment";
import { toast } from "sonner";

export const useAddWallet = () => {
  return useMutation({
    mutationFn: CreateWalletOrder,
  });
};

export const useVerifyWalletPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: verifyPayment,
    onSuccess: () => {
      toast.success("Wallet updated!");
      queryClient.invalidateQueries(["wallet"]);
    },

    onError: () => {
      toast.error("Payment verification failed");
    },
  });
};

//when ordering
// src/hooks/paymentsHooks.js

export const useCreateRazorpayOrder = () => {
  return useMutation({
    mutationFn: (amount) => createRazorpayOrderService(amount),
    onError: () => toast.error("Failed to create payment"),
  });
};

export const useVerifyRazorpayPayment = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload) => verifyPaymentService(payload),
    onSuccess: () => {
      toast.success("Payment successful");
      // invalidate queries: cart, orders, wallet — change keys to your project keys
      qc.invalidateQueries(["cart"]);
      qc.invalidateQueries(["orders"]);
      qc.invalidateQueries(["wallet"]);
    },
    onError: () => toast.error("Payment verification failed"),
  });
};
