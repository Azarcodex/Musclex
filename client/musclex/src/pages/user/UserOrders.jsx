import React, { useState } from "react";
import { Package, MessageSquare, RotateCcw, RefreshCw } from "lucide-react";
import { useForm } from "react-hook-form";
import {
  useCancelOrder,
  useCancelProductOrder,
  usegetOrderLists,
  useReturnOrder,
} from "../../hooks/users/useOrder";
import { useNavigate } from "react-router-dom";
import { confirm } from "../../components/utils/Confirmation";
import { toast } from "sonner";

export default function UserOrdersPage() {
  const { data: myOrders } = usegetOrderLists();
  const [filterStatus, setFilterStatus] = useState("All");
  const navigate = useNavigate();
  const { mutate: cancelOrder } = useCancelOrder();
  const { mutate: cancelProductOrder } = useCancelProductOrder();
  const { mutate: returnOrder } = useReturnOrder();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const [returnView, setReturnView] = useState(false);
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
  const getReturnStatusColor = (status) => {
    switch (status) {
      case "Requested":
        return "bg-yellow-100 text-yellow-800";
      case "Approved":
        return "bg-green-100 text-green-800";
      case "Rejected":
        return "bg-red-100 text-red-800";
      case "Completed":
        return "bg-purple-100 text-purple-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

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
  //cancel product order
  const HandleProductCancel = async (orderId, item_id) => {
    const wait = await confirm({
      message: "Are you sure you want to cancel these item",
    });
    if (wait) {
      cancelProductOrder(
        { orderId, item_id },
        {
          onSuccess: (data) => {
            toast.success(data.message);
          },
          onError: (err) => {
            toast.error(err.response.data.message);
          },
        }
      );
    }
  };
  //return
  const HandleReturnOrderView = () => {
    setReturnView(true);
  };
  const onSubmit = async (data, orderId, itemId) => {
    const wait = await confirm({
      message: "are you sure you want to return the order",
    });
    if (wait) {
      returnOrder(
        { reason: data.returnReason, orderId, itemId },
        {
          onSuccess: (data) => {
            toast.success(data.message);
            setReturnView(false);
            reset();
          },
          onError: (err) => {
            toast.error(err.response.data.message);
          },
        }
      );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-2">My Orders</h1>
        <div className="float-right flex items-center gap-3">
          <button
            onClick={() => navigate("/user/userdetails/profile")}
            className="bg-purple-600 rounded-sm p-1 text-white"
          >
            back to userPage
          </button>
          <button
            onClick={() => navigate("/user/products")}
            className="bg-pink-600 text-white rounded-sm p-1"
          >
            back to home
          </button>
        </div>
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
                          {order.orderStatus !== "Cancelled" && (
                            <span
                              className={`text-xs ${getStatusColor(
                                item.status
                              )}`}
                            >
                              {item.status}
                            </span>
                          )}
                        </div>

                        <p className="font-semibold ml-20">
                          ₹{(item.price * item.quantity).toLocaleString()}
                        </p>

                        {[
                          "Pending",
                          "Confirmed",
                          "Processing",
                          "Shipped",
                          "Out for Delivery",
                        ].includes(item.status) &&
                          [
                            "Pending",
                            "Confirmed",
                            "Processing",
                            "Shipped",
                            "Out for Delivery",
                          ].includes(order.orderStatus) && (
                            <>
                              {/* <button
                              className="text-sm text-purple-600"
                              onClick={() =>
                                navigate(`/user/orders/track/${order._id}`)
                              }
                            >
                              Track Order
                            </button> */}

                              <button
                                onClick={() =>
                                  HandleProductCancel(order._id, item._id)
                                }
                                className="bg-red-600 text-xs cursor-pointer rounded-md text-white font-bold px-2 py-1 hover:bg-red-400"
                              >
                                cancel
                              </button>
                            </>
                          )}
                        {item.status === "Delivered" && (
                          <>
                            <button className="flex items-center gap-2 text-sm text-purple-600">
                              <MessageSquare size={16} />
                              Add Review
                            </button>

                            <button
                              onClick={HandleReturnOrderView}
                              className="cursor-pointer flex items-center gap-2 text-sm text-red-600"
                            >
                              <RotateCcw size={16} />
                              Return Order
                            </button>
                            {returnView && (
                              <div className="fixed inset-0 z-50 flex items-center justify-center">
                                {/* Background Blur */}
                                <div
                                  className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                                  onClick={() => setReturnView(false)}
                                ></div>

                                {/* Modal */}
                                <div className="relative z-50 w-full max-w-md bg-white rounded-xl shadow-lg p-6 animate-fadeIn">
                                  <div className="flex items-center gap-2 mb-4">
                                    <RefreshCw className="w-5 h-5 text-purple-700" />
                                    <h2 className="text-lg font-semibold text-gray-800">
                                      Return Product
                                    </h2>
                                  </div>

                                  <div className="flex flex-col gap-3">
                                    <form
                                      onSubmit={handleSubmit((data) =>
                                        onSubmit(data, order._id, item._id)
                                      )}
                                    >
                                      <input
                                        type="text"
                                        placeholder="Enter the reason"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                                        {...register("returnReason", {
                                          required: "enter a reason",
                                        })}
                                      />

                                      {errors.returnReason && (
                                        <p className="text-red-600 text-xs">
                                          {errors.returnReason.message}
                                        </p>
                                      )}

                                      <div className="flex justify-end gap-3 mt-2">
                                        <button
                                          onClick={() => setReturnView(false)}
                                          className="px-4 py-2 text-sm rounded-md bg-gray-200 hover:bg-gray-300"
                                        >
                                          Cancel
                                        </button>

                                        <button
                                          type="submit"
                                          className="px-4 py-2 text-sm rounded-md bg-purple-600 text-white hover:bg-purple-700"
                                        >
                                          Submit
                                        </button>
                                      </div>
                                    </form>
                                  </div>
                                </div>
                              </div>
                            )}
                          </>
                        )}
                        {item.status === "Returned" && (
                          <div className="flex flex-col items-center gap-1 mt-1">
                            <span
                              className={`${getReturnStatusColor(
                                item.returnStatus
                              )} px-3 py-1 rounded-full text-[11px] font-medium`}
                            >
                              {item.returnStatus}
                            </span>

                            {item.returnStatus === "Rejected" && (
                              <button
                                onClick={() => toast.message(item.vendorReason)}
                                className="text-[12px] text-purple-700 underline hover:text-purple-900 transition cursor-pointer"
                              >
                                View reason
                              </button>
                            )}
                          </div>
                        )}
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
                  {[
                    "Pending",
                    "Confirmed",
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
