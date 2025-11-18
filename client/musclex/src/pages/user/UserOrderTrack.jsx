import React, { useState } from "react";
import {
  ChevronDown,
  ChevronUp,
  Package,
  CreditCard,
  Calendar,
} from "lucide-react";
import { usegetOrderTrack } from "../../hooks/users/useOrder";
import { useParams } from "react-router-dom";

export default function UserOrderTrack() {
  const orderId = useParams();
  const { data } = usegetOrderTrack(orderId);
  console.log(data);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "text-yellow-600";
      case "Confirmed":
        return "text-purple-600";
      case "Processing":
        return "text-indigo-600";
      case "Shipped":
        return "text-blue-600";
      case "Out for Delivery":
        return "text-cyan-600";
      case "Delivered":
        return "text-green-600";
      case "Cancelled":
        return "text-red-600";
      case "Returned":
        return "text-orange-600";
      default:
        return "text-gray-600";
    }
  };

  const statusSteps = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
  ];

  const statusIndex = (orderStatus) => statusSteps.indexOf(orderStatus);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">My Orders</h1>

        {data?.message?.map((order) => (
          <div
            key={order._id}
            className="bg-white rounded-lg shadow-sm border border-gray-200"
          >
            {/* HEADER */}
            <div className="p-4 border-b flex justify-between items-center">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {order.orderId}
                </p>
                <p className="text-xs text-gray-500">
                  Ordered on {formatDate(order.createdAt)}
                </p>

                <p
                  className={`mt-2 text-sm font-medium ${getStatusColor(
                    order.orderStatus
                  )}`}
                >
                  Status: {order.orderStatus}
                </p>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* TRACKING BAR */}
              <div className="relative w-full px-2">
                {/* Background Line (Gray) */}
                <div className="absolute top-2.5 left-2 right-2 h-0.5 bg-gray-300"></div>

                {/* Progress Line (Purple) */}
                <div
                  className="absolute top-2.5 left-2 h-0.5 bg-purple-600"
                  style={{
                    width: `calc(${
                      (statusIndex(order.orderStatus) /
                        (statusSteps.length - 1)) *
                      100
                    }% - 8px)`,
                  }}
                ></div>

                <div className="relative w-full flex justify-between">
                  {statusSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center flex-1"
                    >
                      <div
                        className={`w-5 h-5 rounded-full border-2 bg-white z-10 ${
                          index <= statusIndex(order.orderStatus)
                            ? "bg-purple-600 border-purple-600"
                            : "border-gray-300"
                        }`}
                      ></div>
                      <p
                        className={`text-xs mt-1 ${
                          index <= statusIndex(order.orderStatus)
                            ? "text-purple-600"
                            : "text-gray-500"
                        }`}
                      >
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* ORDERED ITEMS */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Package size={16} /> Items
                </h3>

                <div className="space-y-3">
                  {order.orderedItems.map((item) => (
                    <div
                      key={item._id}
                      className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {item.productID?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {item.variantID?.flavour} • Qty: {item.quantity}
                        </p>
                      </div>

                      <p className="text-sm font-semibold">
                        ₹{item.price.toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* PAYMENT INFO */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <CreditCard size={16} /> Payment
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Method: </span>
                    {order.paymentMethod}
                  </p>

                  <p className="text-sm">
                    <span className="text-gray-600">Status: </span>
                    {order.paymentStatus}
                  </p>
                </div>
              </div>

              {/* DELIVERY INFO */}
              <div>
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                  <Calendar size={16} /> Delivery
                </h3>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Expected Delivery: </span>
                    {formatDate(order.expectedDelivery)}
                  </p>

                  <p className="text-sm">
                    <span className="text-gray-600">Last Updated: </span>
                    {formatDate(order.updatedAt)}
                  </p>
                </div>
              </div>

              {/* PRICE SUMMARY */}
              <div className="border-t pt-4 flex justify-end">
                <div className="w-60 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span>₹{order.totalPrice.toLocaleString()}</span>
                  </div>

                  {order.discount > 0 && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Discount:</span>
                      <span className="text-green-600">
                        -₹{order.discount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-base font-semibold pt-2 border-t">
                    <span>Total:</span>
                    <span>₹{order.finalAmount.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
