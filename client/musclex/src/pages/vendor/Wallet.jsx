import React, { useState } from "react";

import { toast } from "sonner";
import {
  useVendorWallet,
  useWithdraw,
} from "../../hooks/vendor/useVendorWallet";

export default function VendorWalletPage() {
  const { data, isLoading } = useVendorWallet();
  const withdrawMutation = useWithdraw();
  const [amount, setAmount] = useState("");

  if (isLoading) return <p>Loading wallet...</p>;

  const handleWithdraw = () => {
    const val = Number(amount);
    if (!val || val <= 0) return toast.error("Enter valid amount");
    if (val > data.wallet.balance) return toast.error("Insufficient balance");

    withdrawMutation.mutate({ amount: val });
    setAmount("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-xl font-bold">Vendor Wallet</h1>

      {/* Wallet Card */}
      <div className="bg-white shadow p-5 rounded-lg">
        <p className="text-gray-500">Available Balance</p>
        <p className="text-3xl font-bold">₹{data.wallet.balance}</p>

        <div className="flex gap-3 mt-4">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            className="border px-3 py-2 rounded w-full"
          />
          <button
            onClick={handleWithdraw}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded"
            disabled={withdrawMutation.isPending}
          >
            {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
          </button>
        </div>
      </div>

      {/* Ledger */}
      <div>
        <h2 className="text-lg font-semibold mb-2">Transaction History</h2>

        {data.ledger.length === 0 && (
          <p className="text-gray-500">No transactions</p>
        )}

        <div className="space-y-3">
          {data.ledger.map((log) => (
            <div key={log._id} className="bg-gray-50 p-3 rounded border">
              <div className="flex justify-between">
                <span className="font-semibold">{log.type}</span>
                <span>
                  {log.type === "ORDER_EARNING" ? "+" : "-"}₹{log.amount}
                </span>
              </div>
              <p className="text-sm text-gray-600">{log.note}</p>
              <p className="text-xs text-gray-400">
                {new Date(log.createdAt).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
