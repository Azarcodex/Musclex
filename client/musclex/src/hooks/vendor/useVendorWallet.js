import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { toast } from "sonner";
import {
  approveWithdrawal,
  createWithdrawalRequest,
  fetchVendorWallet,
  fetchWithdrawals,
} from "../../services/vendor/vendorWallet";

// Vendor — GET wallet + ledger
export const useVendorWallet = () =>
  useQuery({
    queryKey: ["vendor-wallet"],
    queryFn: fetchVendorWallet,
  });

// Vendor — request withdrawal
export const useWithdraw = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: createWithdrawalRequest,
    onSuccess: () => {
      toast.success("Withdrawal requested successfully");
      qc.invalidateQueries(["vendor-wallet"]);
    },
    onError: () => toast.error("Withdrawal failed"),
  });
};

// Admin — get withdrawal list
export const useAdminWithdrawals = () =>
  useQuery({
    queryKey: ["admin-withdrawals"],
    queryFn: fetchWithdrawals,
  });

// Admin — approve withdrawal
export const useApproveWithdrawal = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: approveWithdrawal,
    onSuccess: () => {
      toast.success("Marked as PAID");
      qc.invalidateQueries(["admin-withdrawals"]);
    },
    onError: () => toast.error("Failed"),
  });
};
