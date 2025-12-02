import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Wallet,
  Clock,
  TrendingUp,
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

  // FETCH WALLET + LEDGER
  const { data, isPending, isError } = useGetWallets();

  // CREATE ORDER HOOK
  const { mutate: createOrder, isPending: creatingOrder } = useAddWallet();

  // VERIFY PAYMENT HOOK
  const { mutate: verifyPayment, isPending: verifying } =
    useVerifyWalletPayment();

  if (isPending) return <p>Loading...</p>;
  if (isError) return <p>Error occurred!</p>;

  const { wallet, ledger } = data;

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // ------------------------------
  // HANDLE ADD MONEY
  // ------------------------------
  const handleAddMoney = () => {
    if (!amount || Number(amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    // Create Razorpay Order
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

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* ------------------------------------------- */}
      {/* WALLET BALANCE CARD */}
      {/* ------------------------------------------- */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Wallet size={24} className="text-gray-700" />
          <h2 className="text-xl font-semibold text-gray-800">
            Wallet Balance
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Available Balance</p>
            <p className="text-2xl font-bold text-gray-900">
              ₹{wallet?.balance?.toLocaleString()}
            </p>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600 mb-1">Hold Balance</p>
            <p className="text-2xl font-bold text-orange-600">
              ₹{wallet?.holdBalance?.toLocaleString()}
            </p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>
            Status:{" "}
            <span className="font-medium text-green-600">{wallet?.status}</span>
          </span>
          <span className="flex items-center gap-1">
            <Clock size={14} />
            Last transaction: {formatDate(wallet?.lastTransactionAt)}
          </span>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* ADD MONEY */}
      {/* ------------------------------------------- */}
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h3 className="text-base font-semibold text-gray-800 mb-4">
          Add Money
        </h3>

        <div className="flex gap-3">
          <input
            type="number"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
          />

          <button
            onClick={handleAddMoney}
            disabled={creatingOrder || verifying}
            className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 disabled:bg-purple-300"
          >
            {creatingOrder || verifying ? "Processing..." : "Add Money"}
          </button>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* TRANSACTION HISTORY */}
      {/* ------------------------------------------- */}
      <div className="bg-white rounded-lg shadow-sm border">
        <button
          onClick={() => toggleSection("transactions")}
          className="w-full flex items-center justify-between p-4 hover:bg-gray-50"
        >
          <div className="flex items-center gap-2">
            <TrendingUp size={20} className="text-gray-700" />
            <h3 className="text-base font-semibold text-gray-800">
              Transaction History
            </h3>
            <span className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded">
              {ledger?.length || 0}
            </span>
          </div>
          {expandedSection === "transactions" ? (
            <ChevronUp size={20} />
          ) : (
            <ChevronDown size={20} />
          )}
        </button>

        {expandedSection === "transactions" && (
          <div className="border-t p-4 space-y-3">
            {ledger?.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No transactions found.
              </p>
            ) : (
              ledger?.map((t) => (
                <div key={t._id} className="bg-gray-50 rounded-lg p-3">
                  <div className="flex justify-between mb-2">
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded ${
                        t.type === "ADD"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {t.type}
                    </span>
                    <span
                      className={`text-sm font-semibold ${
                        t.type === "ADD" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {t.type === "ADD" ? "+" : "-"}₹{t.amount}
                    </span>
                  </div>

                  <p className="text-sm text-gray-700 mb-1">{t.note}</p>

                  <div className="flex justify-between text-xs text-gray-500">
                    <span>Ref: {t.referenceId}</span>
                    <span>{formatDate(t.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
