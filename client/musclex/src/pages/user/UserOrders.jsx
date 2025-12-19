import React, { useState } from "react";
import {
  Package,
  MessageSquare,
  RotateCcw,
  RefreshCw,
  ArrowLeft,
  Home,
  Truck,
  AlertCircle,
  ChevronRight,
  Filter,
  Tag, // Added for coupon icon
  Check,
  PrinterIcon, // Added for applied checkmark
} from "lucide-react";
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
  console.log(myOrders);
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
  const [returnModalOrderId, setReturnModalOrderId] = useState(null);
  const [returnModalItemId, setReturnModalItemId] = useState(null);

  //cancel
  const [cancelProductView, setCancelProductView] = useState(false);
  const [cancelModalOrderId, setcancelModalOrderId] = useState(null);
  const [cancelModalItemId, setcancelModalItemId] = useState(null);
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
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Approved":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "Rejected":
        return "bg-rose-50 text-rose-700 border-rose-200";
      case "Completed":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-600/20";
      case "Confirmed":
        return "bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20";
      case "Processing":
        return "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-600/20";
      case "Shipped":
        return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20";
      case "Out for Delivery":
        return "bg-cyan-50 text-cyan-700 ring-1 ring-inset ring-cyan-600/20";
      case "Delivered":
        return "bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20";
      case "Cancelled":
        return "bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-600/20";
      case "Returned":
        return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-600/20";
      default:
        return "bg-gray-50 text-gray-600 ring-1 ring-inset ring-gray-500/20";
    }
  };

  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const filteredOrders = myOrders?.message?.filter((order) =>
    filterStatus === "All" ? true : order.orderStatus === filterStatus
  );

  const HandleCancel = async (id) => {
    const wait = await confirm({
      message: "Are you sure you want to cancel these order",
    });
    if (wait) {
      cancelOrder(id, {
        onSuccess: (data) => toast.success(data.message),
        onError: (err) => toast.error(err.response.data.message),
      });
    }
  };

  const HandleProductCancel = async (data, orderId, item_id) => {
    const wait = await confirm({
      message: "Are you sure you want to cancel these item",
    });
    if (wait) {
      cancelProductOrder(
        { reason: data.cancelReason, orderId, item_id },
        {
          onSuccess: (data) => {
            toast.success(data.message);
            setCancelProductView(false);
            reset();
          },
          onError: (err) => toast.error(err.response.data.message),
        }
      );
    }
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
          onError: (err) => toast.error(err.response.data.message),
        }
      );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50/50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
              My Orders 📦
            </h1>
            <p className="text-gray-500 mt-1 text-sm">
              Track, manage and return your orders
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/user/userdetails/profile")}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-50 hover:text-purple-600 transition-colors shadow-sm"
            >
              <ArrowLeft size={16} />
              Back to Profile
            </button>
            <button
              onClick={() => navigate("/user/products")}
              className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
            >
              <Home size={16} />
              Shop Home
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <aside className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm sticky top-6 overflow-hidden">
              <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-900 flex items-center gap-2 uppercase tracking-wider">
                  <Filter size={16} className="text-purple-600" />
                  Filter Status
                </h2>
              </div>
              <div className="p-2">
                {statusOptions.map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`w-full flex items-center justify-between px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                      filterStatus === status
                        ? "bg-purple-50 text-purple-700"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    }`}
                  >
                    {status}
                    {filterStatus === status && <ChevronRight size={14} />}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="lg:col-span-9 space-y-6">
            {filteredOrders?.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-300 p-12 text-center">
                <div className="mx-auto w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <Package className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900">
                  No orders found
                </h3>
                <p className="text-gray-500 text-sm mt-1">
                  Try changing your filter or start shopping.
                </p>
              </div>
            )}

            {filteredOrders?.map((order) => (
              <div
                key={order._id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-300"
              >
                <div className="px-6 py-4 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-4 items-center justify-between">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6">
                    {/* Order ID */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                        Order ID
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        #{order.orderId}
                      </p>
                    </div>
                    {/* Date Placed */}
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">
                        Date Placed
                      </p>
                      <p className="text-sm font-medium text-gray-900">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    {/* Coupon Applied - ENHANCED STYLE */}
                    {order.coupon.applied && (
                      <div className="bg-purple-50 border border-purple-200 p-2 rounded-lg flex items-center gap-3">
                        <Tag size={18} className="text-purple-600 shrink-0" />
                        <div>
                          <p className="text-xs text-purple-600 uppercase font-bold tracking-wider flex items-center gap-1">
                            COUPON APPLIED <Check size={12} />
                          </p>
                          <p className="text-sm font-mono text-purple-900">
                            {order.coupon.code || "N/A"}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* Order Status Badge */}
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(
                      order.orderStatus
                    )}`}
                  >
                    {order.orderStatus}
                  </span>
                </div>

                <div className="p-6">
                  <div className="space-y-6">
                    {order.orderedItems.map((item) => (
                      <div
                        key={item._id}
                        className="group flex flex-col sm:flex-row gap-5"
                      >
                        <div className="relative shrink-0 overflow-hidden rounded-xl border border-gray-100 w-full sm:w-24 h-24 bg-gray-50">
                          <img
                            src={`${import.meta.env.VITE_API_URL}${
                              item.variantID?.images?.[0]
                            }`}
                            alt="product"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start gap-4">
                              <div>
                                <h4 className="font-semibold text-gray-900 line-clamp-1">
                                  {item.productID?.name}
                                </h4>
                                <p className="text-sm text-gray-500">
                                  {item.productID?.brandID?.brand_name}
                                </p>
                              </div>
                              <p className="font-semibold text-gray-900 whitespace-nowrap">
                                ₹{(item.price * item.quantity).toLocaleString()}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center gap-3 text-sm text-gray-500">
                              <span className="bg-gray-100 px-2 py-0.5 rounded text-xs">
                                {item.variantID?.flavour}
                              </span>
                              <span className="text-xs">
                                Qty: {item.quantity}
                              </span>
                              {order.orderStatus !== "Cancelled" && (
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${getStatusColor(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-3 flex flex-wrap items-center gap-3">
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
                                <button
                                  onClick={() => {
                                    setcancelModalOrderId(order._id);
                                    setcancelModalItemId(item._id);
                                    setCancelProductView(true);
                                  }}
                                  className="text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                                >
                                  Cancel Item
                                </button>
                              )}

                            {item.status === "Delivered" && (
                              <>
                                <button className="flex items-center gap-1.5 text-xs font-medium text-purple-600 hover:text-purple-700 hover:bg-purple-50 px-2 py-1 rounded transition-colors">
                                  <MessageSquare size={14} />
                                  Write Review
                                </button>
                                <button
                                  onClick={() => {
                                    setReturnModalOrderId(order._id);
                                    setReturnModalItemId(item._id);
                                    setReturnView(true);
                                  }}
                                  className="flex items-center gap-1.5 text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 px-2 py-1 rounded transition-colors"
                                >
                                  <RotateCcw size={14} />
                                  Return Item
                                </button>
                                {returnView &&
                                  returnModalOrderId === order._id &&
                                  returnModalItemId === item._id && (
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                      <div
                                        className="absolute inset-0 bg-black/50"
                                        onClick={() => setReturnView(false)}
                                      />

                                      <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                        <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                                          <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                            <RefreshCw size={20} />
                                          </div>
                                          <h2 className="text-lg font-bold text-gray-900">
                                            Return Request
                                          </h2>
                                        </div>

                                        <div className="p-6">
                                          <form
                                            onSubmit={handleSubmit((data) =>
                                              onSubmit(
                                                data,
                                                returnModalOrderId,
                                                returnModalItemId
                                              )
                                            )}
                                            className="space-y-4"
                                          >
                                            <div>
                                              <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Reason for return
                                              </label>
                                              <textarea
                                                placeholder="Please describe why you are returning this item..."
                                                rows={3}
                                                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none text-sm"
                                                {...register("returnReason", {
                                                  required:
                                                    "Please provide a reason",
                                                })}
                                              />
                                              {errors.returnReason && (
                                                <p className="text-red-500 text-xs mt-1 flex items-center gap-1">
                                                  <AlertCircle size={12} />
                                                  {errors.returnReason.message}
                                                </p>
                                              )}
                                            </div>

                                            <div className="flex gap-3 pt-2">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  setReturnView(false)
                                                }
                                                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                              >
                                                Cancel
                                              </button>

                                              <button
                                                type="submit"
                                                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                                              >
                                                Submit Request
                                              </button>
                                            </div>
                                          </form>
                                        </div>
                                      </div>
                                    </div>
                                  )}
                              </>
                            )}

                            {/* //cancel reason */}

                            {cancelProductView &&
                              cancelModalOrderId === order._id &&
                              cancelModalItemId === item._id && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                                  <div
                                    className="absolute inset-0 bg-black/50"
                                    onClick={() => setCancelProductView(false)}
                                  />

                                  <div className="relative z-50 w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                                    <div className="p-6 border-b border-gray-100 flex items-center gap-3 bg-gray-50/50">
                                      <div className="p-2 bg-purple-100 rounded-lg text-purple-600">
                                        <RefreshCw size={20} />
                                      </div>
                                      <h2 className="text-lg font-bold text-gray-900">
                                        cancel Reason
                                      </h2>
                                    </div>

                                    <div className="p-6">
                                      <form
                                        onSubmit={handleSubmit((data) =>
                                          HandleProductCancel(
                                            data,
                                            cancelModalOrderId,
                                            cancelModalItemId
                                          )
                                        )}
                                        className="space-y-4"
                                      >
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Reason for cancel
                                          </label>
                                          <textarea
                                            placeholder="Please describe why you are returning this item..."
                                            rows={3}
                                            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none text-sm"
                                            {...register("cancelReason", {
                                              required: "enter a reason",
                                            })}
                                          />
                                          {errors.cancelReason && (
                                            <p className="text-red-700 text-xs">
                                              *{errors.cancelReason.message}
                                            </p>
                                          )}
                                        </div>

                                        <div className="flex gap-3 pt-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setCancelProductView(false)
                                            }
                                            className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                          >
                                            Cancel
                                          </button>

                                          <button
                                            type="submit"
                                            className="flex-1 px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
                                          >
                                            Submit
                                          </button>
                                        </div>
                                      </form>
                                    </div>
                                  </div>
                                </div>
                              )}

                            {item.status === "Returned" && (
                              <div className="flex items-center gap-2">
                                <span
                                  className={`border px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wide ${getReturnStatusColor(
                                    item.returnStatus
                                  )}`}
                                >
                                  {item.returnStatus}
                                </span>
                                {item.returnStatus === "Rejected" && (
                                  <button
                                    onClick={() =>
                                      toast.message(item.vendorReason)
                                    }
                                    className="text-xs text-gray-500 underline decoration-gray-300 underline-offset-2 hover:text-purple-600 transition-colors"
                                  >
                                    View Reason
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <hr className="border-t border-purple-200" />

                  <div className="flex items-center gap-1 place-content-end">
                    <span className="text-sm text-purple-600">total:</span>
                    <span className="font-sans text-lg flex items-center gap-3">
                      {order.discount > 0 ? (
                        <>
                          {/* Original Price */}
                          <span className="text-gray-400 line-through">
                            ₹{order.totalPrice}
                          </span>

                          {/* Final Price */}
                          <span className="text-green-600 font-bold">
                            ₹{order.finalAmount}
                          </span>

                          {/* Discount Badge */}
                          <span className="text-sm bg-green-100 text-green-700 px-2 py-0.5 rounded-md font-semibold">
                            -₹{order.discount}
                          </span>
                        </>
                      ) : (
                        <span className="text-gray-900 font-bold">
                          ₹{order.finalAmount}
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-sm text-gray-500 flex flex-wrap gap-x-6 gap-y-1">
                      <div className="flex items-center gap-2">
                        <Truck size={14} className="text-purple-600" />
                        <span>
                          Expected:{" "}
                          <span className="font-medium text-gray-900">
                            {formatDate(order.expectedDelivery)}
                          </span>
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-400">|</span>
                        <span>
                          Payment:{" "}
                          <span className="font-medium text-gray-900">
                            {order.paymentMethod}
                          </span>
                        </span>
                      </div>
                      {order.orderStatus !== "Cancelled" && (
                        <button
                          onClick={() =>
                            navigate(`/user/orders/invoice/${order._id}`)
                          }
                          className="flex items-center gap-3 bg-purple-600 rounded-sm p-0.5 text-white text-xs"
                        >
                          <PrinterIcon className="w-3 h-3" />
                          Print Invoice
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      {[
                        "Pending",
                        "Confirmed",
                        "Processing",
                        "Shipped",
                        "Out for Delivery",
                      ].includes(order.orderStatus) && (
                        <>
                          <button
                            onClick={() =>
                              navigate(`/user/orders/track/${order._id}`)
                            }
                            className="px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
                          >
                            Track Order
                          </button>
                          <button
                            onClick={() => HandleCancel(order._id)}
                            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            Cancel Order
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
