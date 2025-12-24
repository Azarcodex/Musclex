import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  useGetTempOrder,
  useRetryPayment,
  useVerifyRetryPayment,
} from "../../hooks/payment/razorpayHook.js";

export default function OrderFailed() {
  const { tempOrderId } = useParams();
  const navigate = useNavigate();

  const { data, isLoading } = useGetTempOrder(tempOrderId);
  console.log(data);
  const { mutate: retryPayment } = useRetryPayment();
  const { mutate: verifyRetry } = useVerifyRetryPayment();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!data?.tempOrder) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Order Not Found
          </h2>
          <p className="text-gray-600 mb-6">
            Invalid or expired order. Please try again.
          </p>
          <button
            onClick={() => navigate("/user/cart")}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Return to Cart
          </button>
        </div>
      </div>
    );
  }

  const temp = data.tempOrder;

  const makeRetryPayment = () => {
    retryPayment(tempOrderId, {
      onSuccess: (res) => {
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID,
          amount: res.amount,
          currency: "INR",
          order_id: res.razorpayOrderId,
          name: "Muscle X",
          description: "Retry Payment",

          handler: function (response) {
            verifyRetry(
              {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                tempOrderId,
              },
              {
                onSuccess: (data) => {
                  toast.success("Payment Successful!");
                  navigate(`/user/ordersuccess/${data.order._id}`, {
                    replace: true,
                  });
                },
                onError: () => {
                  toast.error("Payment failed again");
                  navigate(`/user/orderfailed/${tempOrderId}`);
                },
              }
            );
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      },
      onError: () => toast.error("Unable to start retry payment"),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100">
        {/* Header Section */}
        <div className="bg-gradient-to-r from-red-50 to-orange-50 p-8 text-center border-b border-red-100">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Payment Unsuccessful
          </h1>
          {/* <p className="text-gray-600 text-sm">
            Don't worry, your order is saved. Complete your payment to proceed.
          </p> */}
        </div>

        {/* Order Summary Section */}
        <div className="p-8">
          <div className="bg-gradient-to-br from-purple-50 to-indigo-50 rounded-xl p-6 mb-6 border border-purple-100">
            <h2 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
              <svg
                className="w-5 h-5 mr-2 text-purple-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Order Summary
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600 text-sm font-medium">
                  Total Amount
                </span>
                <span className="text-2xl font-bold text-gray-900">
                  ₹{temp.finalAmount}
                </span>
              </div>
              <div className="flex justify-between items-center pt-3 border-t border-purple-200">
                <span className="text-gray-600 text-sm font-medium">
                  Items in Order
                </span>
                <span className="text-lg font-semibold text-purple-700">
                  {temp.orderedItems.length}
                </span>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 flex items-start">
            <svg
              className="w-5 h-5 text-blue-600 mr-3 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-blue-800">
              You can retry the payment now
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={makeRetryPayment}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-4 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center group"
            >
              <svg
                className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              Retry Payment
            </button>

            <button
              onClick={() => navigate("/",{replace:true})}
              className="w-full bg-white hover:bg-gray-50 text-gray-700 px-6 py-4 rounded-xl font-semibold transition-all duration-200 border-2 border-gray-200 hover:border-gray-300 flex items-center justify-center"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Return to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
