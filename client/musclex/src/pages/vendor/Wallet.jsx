import React, { useState } from "react";

import { toast } from "sonner";
import {
  useVendorWallet,
  useWithdraw,
} from "../../hooks/vendor/useVendorWallet";

// Define a function to get Tailwind CSS classes based on transaction type
const getTransactionStyles = (type) => {
  switch (type) {
    case "ORDER_EARNING":
      return {
        text: "text-green-600",
        bg: "bg-green-50/50",
        sign: "+",
      };
    case "WITHDRAWAL":
      return {
        text: "text-red-600",
        bg: "bg-red-50/50",
        sign: "-",
      };
    default:
      return {
        text: "text-pink-600",
        bg: "bg-gray-50/50",
        sign: "",
      };
  }
};

export default function VendorWalletPage() {
  const { data, isLoading } = useVendorWallet();
  const withdrawMutation = useWithdraw();
  const [amount, setAmount] = useState("");
  // New state to manage the dropdown/accordion visibility
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  if (isLoading)
    return (
      <div className="max-w-3xl mx-auto p-6 flex justify-center items-center h-40">
        <p className="text-lg text-gray-600">Loading wallet...</p>
      </div>
    );

  const handleWithdraw = () => {
    const val = Number(amount);
    if (!val || val <= 0) return toast.error("Enter valid amount");
    if (val > data.wallet.balance) return toast.error("Insufficient balance");

    withdrawMutation.mutate({ amount: val });
    setAmount("");
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-extrabold text-gray-800 border-b pb-2">
        💳 Vendor Wallet
      </h1>

      {/* --- */}

      {/* Wallet Card */}
      <div className="bg-white shadow-xl rounded-xl p-6 border border-purple-100">
        <p className="text-lg text-gray-500 font-medium mb-1">
          Available Balance
        </p>
        <p className="text-5xl font-bold text-purple-600 tracking-tight">
          ₹{data.wallet.balance}
        </p>

        {/* Withdrawal Form (Kept commented as it was in the initial request) */}
        {/* <div className="flex gap-4 mt-6 pt-4 border-t border-gray-100">
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount to withdraw"
            className="border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 px-4 py-2 rounded-lg w-full transition duration-150 ease-in-out"
          />
          <button
            onClick={handleWithdraw}
            className="bg-purple-600 hover:bg-purple-700 active:bg-purple-800 text-white font-semibold px-6 py-2 rounded-lg shadow-md transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={
              withdrawMutation.isPending ||
              !data.wallet.balance ||
              data.wallet.balance <= 0
            }
          >
            {withdrawMutation.isPending ? "Processing..." : "Withdraw"}
          </button>
        </div> */}
      </div>

      {/* --- */}

      {/* Ledger - Converted to Dropdown/Accordion */}
      <div className="bg-white shadow-xl rounded-xl border border-gray-200">
        {/* Dropdown Header/Toggle Button */}
        <button
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
          className="w-full flex justify-between items-center p-5 text-left font-bold text-gray-800 hover:bg-gray-50 transition duration-150 rounded-t-xl"
        >
          <h2 className="text-xl">📚 Transaction History</h2>
          <svg
            className={`w-5 h-5 transition-transform duration-300 ${
              isHistoryOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 9l-7 7-7-7"
            ></path>
          </svg>
        </button>

        {/* Dropdown Content */}
        {isHistoryOpen && (
          <div className="p-5 border-t border-gray-200">
            {data.ledger.length === 0 && (
              <div className="bg-gray-100 p-4 rounded-lg text-center">
                <p className="text-gray-500 italic">
                  No transactions recorded yet.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {data.ledger.map((log) => {
                const { text, bg, sign } = getTransactionStyles(log.type);
                return (
                  <div
                    key={log._id}
                    className={`${bg} p-4 rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition duration-150`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">
                        {log.type.replace("_", " ")}
                      </span>
                      <span className={`text-xl font-bold ${text}`}>
                        {sign}₹{log.amount}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">{log.note}</p>
                    <p className="text-xs text-gray-400 mt-2">
                      {new Date(log.createdAt).toLocaleString()}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
