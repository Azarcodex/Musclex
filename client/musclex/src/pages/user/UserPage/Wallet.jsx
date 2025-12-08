import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Wallet,
  Clock,
  TrendingUp,
  PlusCircle,
  Zap,
} from "lucide-react";
import { useGetWallets } from "../../../hooks/users/usegetWallets";
import { toast } from "sonner";
import {
  useAddWallet,
  useVerifyWalletPayment,
} from "../../../hooks/payment/paymenthook";

export default function WalletComponent() {
  const [expandedSection, setExpandedSection] = useState(null);
  const [amount, setAmount] = useState("");

  const { data, isPending, isError } = useGetWallets();

  const { mutate: createOrder, isPending: creatingOrder } = useAddWallet();

  const { mutate: verifyPayment, isPending: verifying } =
    useVerifyWalletPayment();

  if (isPending)
    return (
      <div className="max-w-4xl mx-auto p-6 flex justify-center items-center h-48 bg-gray-50 rounded-xl shadow-lg">
        <p className="text-lg font-medium text-gray-700 animate-pulse">
          Loading Wallet Data...
        </p>
      </div>
    );
  if (isError)
    return (
      <div className="max-w-4xl mx-auto p-6 bg-red-100 border border-red-400 text-red-700 rounded-xl shadow-lg">
        <p className="font-semibold">
          Error occurred while fetching wallet data.
        </p>
      </div>
    );

  const { wallet, ledger } = data;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddMoney = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    createOrder(
      { amount: Number(amount) },
      {
        onSuccess: (orderData) => {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: Number(amount) * 100,
            currency: "INR",
            order_id: orderData.orderId,
            handler: function (response) {
              verifyPayment(
                {
                  amount: Number(amount),
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                },
                {
                  onSuccess: () => {
                    setAmount("");
                  },
                }
              );
            },
            theme: {
              color: "#3b82f6",
            },
          };

          const rzp = new window.Razorpay(options);
          rzp.open();
        },
        onError: (err) => toast.error(err.response.data.message),
      }
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isLoading = creatingOrder || verifying;
  const primaryColor = "purple-600";
  const lightPrimaryColor = "purple-100";

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* ------------------------------------------- */}
      {/* WALLET BALANCE CARD - Clean White/Blue */}
      {/* ------------------------------------------- */}
      <div
        className={`bg-white text-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 transform hover:shadow-2xl transition duration-300`}
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Wallet size={32} className={`text-${primaryColor}`} />
            <h2 className="text-2xl font-extrabold tracking-wide">
              E-Wallet Dashboard
            </h2>
          </div>
          <span
            className={`text-sm font-medium bg-green-100 text-green-700 px-3 py-1 rounded-full`}
          >
            Active
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 border-t border-gray-200 pt-6">
          <div className="flex flex-col">
            <p className="text-sm text-gray-500 mb-1">Available Balance</p>
            <p className={`text-4xl font-black text-${primaryColor}`}>
              ₹{wallet?.balance?.toLocaleString() || "0"}
            </p>
          </div>

          {/* <div className="flex flex-col md:border-l border-gray-200 md:pl-6">
            <p className="text-sm text-gray-500 mb-1">Hold Balance</p>
            <p className={`text-3xl font-bold text-${holdBalanceColor}`}>
              ₹{wallet?.holdBalance?.toLocaleString() || "0"}
            </p>
          </div> */}

          <div className="flex flex-col justify-end">
            <span className="flex items-center gap-2 text-xs text-gray-500 mt-2">
              <Clock size={14} />
              Last Updated: {formatDate(wallet?.lastTransactionAt)}
            </span>
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* ADD MONEY & TRANSACTION HISTORY GRID */}
      {/* ------------------------------------------- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* ADD MONEY CARD */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-gray-100 p-6 h-min">
          <div className="flex items-center gap-2 mb-4 text-gray-800">
            <PlusCircle size={20} className={`text-${primaryColor}`} />
            <h3 className="text-lg font-semibold text-gray-800">
              Top Up Wallet
            </h3>
          </div>

          <div className="space-y-4">
            <input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className={`w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-4 focus:ring-${lightPrimaryColor} focus:border-${primaryColor} transition duration-150 text-lg`}
              min="1"
            />

            <button
              onClick={handleAddMoney}
              disabled={isLoading}
              className={`w-full flex items-center justify-center gap-2 bg-${primaryColor} text-white px-6 py-3 rounded-xl font-medium shadow-md hover:bg-blue-700 transition duration-200 disabled:bg-blue-300 disabled:cursor-not-allowed`}
            >
              {isLoading ? (
                <>
                  <Zap size={18} className="animate-pulse" />
                  Processing...
                </>
              ) : (
                "Proceed to Pay"
              )}
            </button>
          </div>
        </div>

        {/* TRANSACTION HISTORY */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-100">
          <button
            onClick={() => toggleSection("transactions")}
            className="w-full flex items-center justify-between p-6 hover:bg-gray-50 rounded-t-xl transition duration-150"
          >
            <div className="flex items-center gap-3">
              <TrendingUp size={24} className="text-green-600" />
              <h3 className="text-xl font-bold text-gray-800">
                Transaction History
              </h3>
              <span className="bg-gray-200 text-gray-700 text-sm px-3 py-1 rounded-full font-medium">
                {ledger?.length || 0}
              </span>
            </div>
            {expandedSection === "transactions" ? (
              <ChevronUp size={24} className="text-gray-600" />
            ) : (
              <ChevronDown size={24} className="text-gray-600" />
            )}
          </button>

          {expandedSection === "transactions" && (
            <div className="border-t border-gray-200 p-6 space-y-4 max-h-96 overflow-y-auto">
              {ledger?.length === 0 ? (
                <div className="text-center py-10 bg-gray-50 rounded-lg">
                  <p className="text-base text-gray-500 font-medium">
                    No transactions recorded yet.
                  </p>
                </div>
              ) : (
                ledger?.map((t) => {
                  const isCredit =
                    t.type === "ADD" ||
                    t.type === "REFERRAL" ||
                    t.type === "REFUND";
                  const creditColor = "green-600";
                  const debitColor = "red-600";
                  const amountColor = isCredit ? creditColor : debitColor;

                  return (
                    <div
                      key={t._id}
                      className="flex justify-between items-center p-4 border border-gray-100 rounded-lg shadow-sm hover:shadow-md transition duration-150"
                    >
                      <div>
                        <span
                          className={`text-xs font-semibold px-3 py-1 rounded-full uppercase ${
                            isCredit
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {t.type}
                        </span>
                        <p className="text-sm text-gray-700 mt-2 font-medium">
                          {t.note}
                        </p>
                        <span className="text-xs text-gray-400 mt-1 block">
                          Ref: {t.referenceId}
                        </span>
                      </div>
                      <div className="text-right">
                        <span
                          className={`text-lg font-bold text-${amountColor}`}
                        >
                          {isCredit ? "+" : "-"}₹{t.amount?.toLocaleString()}
                        </span>
                        <p className="text-xs text-gray-500">
                          {formatDate(t.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
