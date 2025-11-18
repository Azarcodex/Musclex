import React, { useState } from "react";
import { Package, MessageSquare, RotateCcw } from "lucide-react";
import { useCancelOrder, usegetOrderLists } from "../../hooks/users/useOrder";
import { useNavigate } from "react-router-dom";
import { confirm } from "../../components/utils/Confirmation";
import { toast } from "sonner";

export default function UserOrdersPage() {
  const { data: myOrders } = usegetOrderLists();
  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();
  const { mutate: cancelOrder } = useCancelOrder();
  const statusOptions = [
    "All",
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
    "Returned",
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800";
      case "Confirmed":
        return "bg-purple-100 text-purple-800";
      case "Processing":
        return "bg-indigo-100 text-indigo-800";
      case "Shipped":
        return "bg-blue-100 text-blue-800";
      case "Out for Delivery":
        return "bg-cyan-100 text-cyan-800";
      case "Delivered":
        return "bg-green-100 text-green-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Returned":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  // FILTERED ORDERS
  const filteredOrders = myOrders?.message?.filter((order) =>
    filterStatus === "All" ? true : order.orderStatus === filterStatus
  );
  //cancel check
  const HandleCancel = async (id) => {
    const wait = await confirm({
      message: "Are you sure you want to cancel these order",
    });
    if (wait) {
      cancelOrder(id, {
        onSuccess: (data) => {
          toast.success(data.message);
        },
        onError: (err) => {
          toast.error(err.response.data.message);
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <p className="text-gray-600">Track and manage your orders</p>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mt-6">
          {/* FILTER SIDEBAR */}
          <aside className="bg-white rounded-xl p-6 border shadow-sm sticky top-4 h-fit">
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Package size={18} className="text-purple-600" />
              Filters
            </h2>

            <div className="space-y-2">
              {statusOptions.map((status) => (
                <label
                  key={status}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <input
                    type="radio"
                    name="status"
                    value={status}
                    checked={filterStatus === status}
                    onChange={() => setFilterStatus(status)}
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </aside>

          {/* ORDERS LIST */}
          <div className="lg:col-span-3 space-y-4">
            {/* EMPTY STATE */}
            {filteredOrders?.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                No orders found.
              </div>
            )}

            {/* ORDER CARD */}
            {filteredOrders?.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-xl border shadow-sm overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm text-gray-500">
                        Order ID: {order.orderId}
                      </p>
                      <p className="text-xs text-gray-400">
                        Ordered on {formatDate(order.createdAt)}
                      </p>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus}
                    </span>
                  </div>

                  {/* ORDERED ITEMS */}
                  <div className="mt-4 space-y-4">
                    {order.orderedItems.map((item) => (
                      <div
                        key={item._id}
                        className="flex items-center gap-4 p-3  rounded-xl bg-gray-50"
                      >
                        <img
                          src={`${import.meta.env.VITE_API_URL}${
                            item.variantID?.images?.[0]
                          }`}
                          alt="product"
                          className="w-20 h-20 object-cover rounded-xl"
                        />

                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">
                            {item.productID?.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {item.productID?.brandID?.brand_name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {item.variantID?.flavour} • Qty: {item.quantity}
                          </p>
                        </div>

                        <p className="font-semibold">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* DELIVERY INFO */}
                  <div className="mt-4 text-sm text-gray-600">
                    Expected Delivery:{" "}
                    <span className="font-semibold text-gray-900">
                      {formatDate(order.expectedDelivery)}
                    </span>
                  </div>
                </div>

                {/* ACTION BUTTONS */}
                <div className="bg-gray-50 p-4 flex justify-end gap-4 border-t">
                  {order.orderStatus === "Delivered" && (
                    <>
                      <button className="flex items-center gap-2 text-sm text-purple-600">
                        <MessageSquare size={16} />
                        Add Review
                      </button>

                      <button className="flex items-center gap-2 text-sm text-red-600">
                        <RotateCcw size={16} />
                        Return Order
                      </button>
                    </>
                  )}

                  {[
                    "Pending",
                    "Processing",
                    "Shipped",
                    "Out for Delivery",
                  ].includes(order.orderStatus) && (
                    <>
                      <button
                        className="text-sm text-purple-600"
                        onClick={() =>
                          navigate(`/user/orders/track/${order._id}`)
                        }
                      >
                        Track Order
                      </button>

                      <button
                        className="text-sm text-red-600"
                        onClick={() => HandleCancel(order._id)}
                      >
                        Cancel Order
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
