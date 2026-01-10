import api from "../../api/axios";


// Vendor: get wallet + ledger
export const fetchVendorWallet = async () => {
  const res = await api.get("/api/vendor/wallet");
  return res.data;
};

// Vendor: request a withdrawal
export const createWithdrawalRequest = async (payload) => {
  const res = await api.post("/api/vendor/wallet/withdraw", payload);
  return res.data;
};

// Admin: list all withdrawals
export const fetchWithdrawals = async () => {
  const res = await api.get("/api/vendor/wallet/admin/withdrawals");
  return res.data;
};

// Admin: approve withdrawal
export const approveWithdrawal = async ({ id, payoutReference }) => {
  const res = await api.post(
    `/api/vendor/wallet/admin/withdrawals/${id}/approve`,
    { payoutReference }
  );
  return res.data;
};
