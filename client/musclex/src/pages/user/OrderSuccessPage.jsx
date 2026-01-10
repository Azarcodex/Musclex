import React from "react";
import { CheckCircle, Home, FileText } from "lucide-react";
import { useGetOrderSummary } from "../../hooks/users/useOrder";
import { useNavigate, useParams } from "react-router-dom";

export default function OrderSuccessPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: orderSummary } = useGetOrderSummary(id);
  console.log(orderSummary);
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Progress Bar */}
        <div className="w-full h-1 bg-gray-200 mb-8 rounded-full overflow-hidden">
          <div className="h-full bg-purple-800 w-full"></div>
        </div>

        {/* Success Card */}
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          {/* Success Icon */}
          <div className="flex justify-center mb-4">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-500" />
            </div>
          </div>

          {/* Main Message */}
          <h1 className="text-2xl font-semibold text-gray-900 mb-3">
            Your order is placed
          </h1>
          <h2 className=" text-center">
            <span className="text-purple-500 text-sm">orderID:</span>
            <span className="text-pink-600 text-sm ml-1">
              {orderSummary?.result?.orderId}
            </span>
          </h2>
          {orderSummary?.result?.razorpayOrderId && (
            <h2 className=" text-center">
              <span className="text-purple-500 text-sm">razorpayOrderId:</span>
              <span className="text-pink-600 text-sm ml-1">
                {orderSummary?.result?.razorpayOrderId}
              </span>
            </h2>
          )}
          {orderSummary?.result?.razorpayPaymentId && (
            <h2 className=" text-center">
              <span className="text-purple-500 text-sm">
                razorpayPaymentId:
              </span>
              <span className="text-pink-600 text-sm ml-1">
                {orderSummary?.result?.razorpayPaymentId}
              </span>
            </h2>
          )}

          {/* Subtext */}
          <p className="text-gray-600 text-sm mb-6">
            Thank you for your payment.
            <br />
            Order invoice sent to your email.
            <br />
            <span className="font-bold text-purple-600">
              {orderSummary?.result?.user}
            </span>
            <br />
            please check your inbox email
          </p>

          {/* Order Details Box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-gray-700 mb-1">
              <span className="font-medium">Total: </span>
              <span className="text-red-500">
                {orderSummary?.result?.couponApplied ? (
                  <span>₹{orderSummary?.result?.finalAmount}</span>
                ) : (
                  <span>₹{orderSummary?.result?.totalPrice}</span>
                )}
              </span>
            </p>
            <p className="text-sm text-gray-700">
              <span className="font-medium">Expected delivery: </span>
              {formatDate(orderSummary?.result?.expectedDelivery)}
            </p>
          </div>

          {/* Invoice Link */}
          <button
            onClick={() => navigate(`/user/orders/invoice/${id}`)}
            className="flex cursor-pointer rounded-md items-center justify-center gap-2 w-full text-sm text-gray-600 hover:text-gray-800 mb-6 py-2"
          >
            <FileText size={16} />
            Invoice
          </button>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/user/products")}
              className="flex-1 px-6 py-2 text-sm border border-purple-500 text-purple-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
            >
              BACK TO PURCHASE
            </button>
            <button
              className="flex-1 px-6 py-2 text-sm border border-purple-500 text-purple-500 rounded-lg font-medium hover:bg-red-50 transition-colors"
              onClick={() => navigate(`/user/orders/track/${id}`)}
            >
              ORDER DETAILS
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
