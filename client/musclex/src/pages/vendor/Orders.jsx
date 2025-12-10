import React, { useEffect, useRef, useState } from "react";
import {
  Package,
  MapPin,
  CreditCard,
  Calendar,
  User,
  Phone,
  ChevronDown,
  ChevronUp,
  X,
  Eye,
  Tag, // New Icon
  Check, // New Icon
} from "lucide-react";
import {
  useGetOrdersList,
  useReturnOrderStatus,
  useUpdateProductStatus,
  useUpdateStatus,
} from "../../hooks/vendor/useGetOrdersList";
import { toast } from "sonner";
import VendorReturnStatusModal from "../../components/vendor/VendorReturnStatusModal";

export default function VendorOrders() {
  const printRef = useRef(null);
  const [expandedOrder, setExpandedOrder] = useState(null);

  // FILTERING
  const [filterStatus, setFilterStatus] = useState("All");

  const statusFilters = [
    "All",
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Returned",
    "Cancelled",
  ];

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProductDetailsModal, setShowProdectDetailsModel] = useState(false);
  const [products, setProducts] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const [showCancelReason, setShowCancelReason] = useState(false);
  const { mutate: updateReturnStatus } = useReturnOrderStatus();
  const { data: orders } = useGetOrdersList();
  console.log(orders);
  //update status
  const { mutate: UpdateStatus } = useUpdateStatus();
  const { mutate: UpdateProductStatus } = useUpdateProductStatus();
  console.log(orders?.message);

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // Placeholder for handleUpdateStatus - currently commented out in JSX but kept for completeness
  const handleUpdateStatus = (order) => {
    setSelectedOrder(order);
    // Assuming the order status is the status of the first item for simplicity, adjust if your API holds an aggregated orderStatus field.
    setSelectedStatus(order.orderStatus);
    setShowStatusModal(true);
  };

  // Placeholder for handleStatusUpdate - required by the Status Update Modal JSX
  const handleStatusUpdate = (orderId) => {
    if (!selectedStatus || selectedStatus === selectedOrder?.orderStatus) {
      toast.error("Please select a new, valid status.");
      return;
    }

    // Logic to call the UpdateStatus mutation for the whole order (if needed)
    // UpdateStatus(
    //   { orderId, status: selectedStatus },
    //   {
    //     onSuccess: (data) => {
    //       toast.success(`Order ${orderId} status updated to ${selectedStatus}.`);
    //       setShowStatusModal(false);
    //     },
    //     onError: (err) => {
    //       toast.error(err.response.data.message);
    //     },
    //   }
    // );

    // For now, we will just close the modal and show a success message
    toast.info(`Attempting to update Order ${orderId} to ${selectedStatus}...`);
    setShowStatusModal(false);
  };
  //no return

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
  };
  const [openModal, setOpenModal] = useState(false);

  const openReturnModal = (orderId, item) => {
    setCurrentOrderId(orderId);
    setProducts(item);
    setOpenModal(true);
  };

  const getNextStatuses = (current) => {
    const flow = [
      "Pending",
      "Confirmed",
      "Processing",
      "Shipped",
      "Out for Delivery",
      "Delivered",
      "Cancelled",
      "Returned",
    ];

    const currentIndex = flow.indexOf(current);

    // return only forward statuses, unless the current status is one that allows any transition (like Cancelled or Returned)
    if (current === "Cancelled" || current === "Returned") return [current]; // Prevent further transition

    return flow.slice(currentIndex + 1).filter((s) => s !== "Returned");
  };

  const HandleSingleProduct = (id, item) => {
    setProducts(item);
    setCurrentOrderId(id);
    setSelectedStatus(item.status);
    setShowProdectDetailsModel(true);
  };

  const HandleUpdateProductStatus = (orderId, item) => {
    if (!selectedStatus || selectedStatus === item.status) {
      toast.error("Please select a new status.");
      return;
    }

    UpdateProductStatus(
      { orderId, id: item._id, status: selectedStatus },
      {
        onSuccess: (data) => {
          toast.success(`${data.message}`);
          setShowProdectDetailsModel(false);
        },
        onError: (err) => {
          toast.error(err.response.data.message);
        },
      }
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800 ring-yellow-500/10";
      case "Confirmed":
        return "bg-purple-100 text-purple-800 ring-purple-500/10";
      case "Processing":
        return "bg-indigo-100 text-indigo-800 ring-indigo-500/10";
      case "Shipped":
        return "bg-blue-100 text-blue-800 ring-blue-500/10";
      case "Out for Delivery":
        return "bg-cyan-100 text-cyan-800 ring-cyan-500/10";
      case "Delivered":
        return "bg-green-100 text-green-800 ring-green-500/10";
      case "Cancelled":
        return "bg-red-100 text-red-800 ring-red-500/10";
      case "Returned":
        return "bg-orange-100 text-orange-800 ring-orange-500/10";
      case "Return Confirmed":
        return "bg-pink-100 text-pink-800 ring-pink-500/10";
      default:
        return "bg-gray-100 text-gray-800 ring-gray-500/10";
    }
  };

  const getPaymentStatusColor = (status) => {
    return status === "Paid"
      ? "bg-green-100 text-green-800 ring-green-500/10"
      : "bg-orange-100 text-orange-800 ring-orange-500/10";
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const statusOptions = [
    "Pending",
    "Confirmed",
    "Processing",
    "Shipped",
    "Out for Delivery",
    "Delivered",
    "Cancelled",
    "Returned",
  ];

  const handlePrint = () => {
    const printContent = printRef.current.innerHTML;

    const printWindow = window.open("", "", "width=900,height=650");

    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${selectedOrder?.orderId || "Order"}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #1f2937; /* Gray-800 */
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 10px;
            }
            th, td {
              border: 1px solid #e5e7eb; /* Gray-200 */
              padding: 10px;
              text-align: left;
            }
            th {
                background-color: #f9fafb; /* Gray-50 */
                font-size: 12px;
                font-weight: 600;
                text-transform: uppercase;
                letter-spacing: 0.05em;
            }
            td {
                font-size: 14px;
            }
            h1, h2, h3, p {
              margin: 0;
              padding: 2px 0;
            }
            .section {
              margin-bottom: 14px;
              padding-bottom: 14px;
              border-bottom: 1px solid #e5e7eb;
            }
            .header-info p {
                font-size: 12px;
                color: #6b7280; /* Gray-500 */
            }
            .summary {
                margin-top: 20px;
                text-align: right;
            }
            .summary-row {
                display: flex;
                justify-content: flex-end;
                margin-top: 5px;
            }
            .summary-label {
                width: 120px;
                font-weight: 500;
                color: #4b5563;
            }
            .summary-value {
                width: 100px;
                font-weight: 600;
                color: #1f2937;
            }
            .summary-total {
                border-top: 2px solid #1f2937;
                padding-top: 5px;
            }
            .text-green { color: #10b981; }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
      printWindow.print();
    }, 300);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900 flex items-center gap-2">
            📦 Orders Management
          </h1>
          <p className="text-gray-600 mt-1">
            View and manage all your orders efficiently.
          </p>
        </div>
        {/* FILTER BAR */}
        <div className="mb-4 flex flex-wrap gap-2">
          {statusFilters.map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                filterStatus === status
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {status}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          {orders?.message?.length > 0 ? (
            orders.message
              .filter((order) => {
                if (filterStatus === "All") return true;
                if (order.orderStatus === filterStatus) return true;

                // Allow returning orders where any item is Returned
                if (filterStatus === "Returned")
                  return order.orderedItems.some(
                    (item) => item.status === "Returned"
                  );

                return false;
              })
              .map((order) => (
                <div
                  key={order._id}
                  className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden transition-all duration-300 hover:shadow-xl"
                >
                  {/* Order Header */}
                  <div className="p-5 border-b border-gray-100 bg-white">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                      <div className="flex items-center gap-4 flex-wrap">
                        <div className="flex flex-col">
                          <p className="text-base font-semibold text-gray-900">
                            Order ID:{" "}
                            <span className="text-blue-600">
                              #{order.orderId}
                            </span>
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Placed On: {formatDate(order.createdAt)}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ${getStatusColor(
                              order.orderStatus
                            )}`}
                          >
                            {order.orderStatus}
                          </span>
                          {order.orderedItems.some(
                            (item) => item.returnStatus === "Rejected"
                          ) && (
                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 ring-red-500/10">
                              Return Rejected
                            </span>
                          )}

                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ring-1 ${getPaymentStatusColor(
                              order.paymentStatus
                            )}`}
                          >
                            {order.paymentStatus}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        {/* Coupon Status Block - New Addition */}
                        {order.couponCode && order.couponApplied && (
                          <div className="bg-purple-50 border border-purple-200 px-3 py-1 rounded-lg flex items-center gap-2">
                            <Tag
                              size={16}
                              className="text-purple-600 shrink-0"
                            />
                            <div className="text-sm">
                              <p className="text-xs text-purple-600 uppercase font-bold tracking-wider flex items-center gap-1">
                                COUPON APPLIED <Check size={12} />
                              </p>
                              <p className="text-xs font-mono text-purple-900">
                                {order.couponCode || "N/A"}
                              </p>
                            </div>
                          </div>
                        )}

                        <div className="text-right">
                          <p className="text-xl font-bold text-gray-900">
                            ₹{order.totalPrice - order.discount}
                          </p>
                          {order.discount > 0 && (
                            <p className="text-xs text-red-500 line-through">
                              ₹{order.totalPrice.toLocaleString("en-IN")}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => toggleExpand(order._id)}
                          className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full transition-colors"
                        >
                          {expandedOrder === order._id ? (
                            <ChevronUp className="text-gray-600" size={20} />
                          ) : (
                            <ChevronDown className="text-gray-600" size={20} />
                          )}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Order Details - Expandable */}
                  {expandedOrder === order._id && (
                    <div className="p-6 bg-gray-50 border-t border-gray-100">
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Column 1: Items & Payment */}
                        <div className="space-y-6 lg:col-span-2">
                          {/* Ordered Items */}
                          <div className="p-4 bg-white rounded-lg shadow-sm border">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2">
                              <Package size={16} className="text-blue-500" />
                              Ordered Items
                            </h3>
                            <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                              {order.orderedItems.map((item) => (
                                <div
                                  key={item._id}
                                  className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-lg shadow-sm"
                                >
                                  <div className="flex flex-col">
                                    <p className="text-sm font-medium text-gray-900">
                                      {item?.productID?.name}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {item.flavour} • Qty: {item.quantity} • ₹
                                      {item.price.toLocaleString("en-IN")}
                                    </p>
                                  </div>

                                  <div className="flex items-center gap-3 shrink-0">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ring-1 ${getStatusColor(
                                        item.status
                                      )}`}
                                    >
                                      {item.status}
                                    </span>
                                    {item.status === "Cancelled" && (
                                      <div className="flex items-center flex-col gap-4">
                                        <button
                                          className="text-xs text-purple-500 hover:underline"
                                          onClick={() =>
                                            setShowCancelReason(
                                              (prevShowCancelReason) =>
                                                !prevShowCancelReason
                                            )
                                          }
                                        >
                                          {showCancelReason
                                            ? "hide reason"
                                            : "show reason"}
                                        </button>
                                        {showCancelReason &&
                                          item.cancelReason && (
                                            <span className="text-xs text-gray-700 p-2 border border-gray-200 rounded">
                                              Reason: {item.cancelReason}
                                            </span>
                                          )}
                                      </div>
                                    )}
                                    {item.status !== "Cancelled" &&
                                      item.status !== "Returned" &&
                                      order.orderStatus !== "Cancelled" && (
                                        <button
                                          className="text-xs px-2 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-600 transition-colors"
                                          onClick={() =>
                                            HandleSingleProduct(order._id, item)
                                          }
                                        >
                                          Update
                                        </button>
                                      )}

                                    {item.status === "Returned" && (
                                      <button
                                        onClick={() =>
                                          openReturnModal(order._id, item)
                                        }
                                        className="text-xs px-2 py-1 rounded-md bg-orange-500 text-white hover:bg-orange-600 transition-colors"
                                      >
                                        Return Status
                                      </button>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Column 2: Address & Delivery */}
                        <div className="space-y-6">
                          {/* Shipping Address */}
                          <div className="p-4 bg-white rounded-lg shadow-sm border">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2">
                              <MapPin size={16} className="text-green-500" />
                              Shipping Address
                            </h3>
                            <div className="space-y-1 text-sm">
                              <p className="font-medium text-gray-900 flex items-center gap-2">
                                <User size={14} className="text-gray-500" />
                                {order.shippingAddress.fullName}
                              </p>
                              <p className="text-gray-600">
                                {order.shippingAddress.addressLine},{" "}
                                {order.shippingAddress.city}
                              </p>
                              {order.shippingAddress.landmark && (
                                <p className="text-gray-600">
                                  L/M: {order.shippingAddress.landmark}
                                </p>
                              )}
                              <p className="text-gray-600">
                                {order.shippingAddress.state} -{" "}
                                {order.shippingAddress.pincode}
                              </p>
                              <p className="text-gray-900 mt-2 flex items-center gap-2 font-medium">
                                <Phone size={14} className="text-gray-500" />
                                {order.shippingAddress.phone}
                              </p>
                            </div>
                          </div>

                          {/* Payment & Delivery Summary */}
                          <div className="p-4 bg-white rounded-lg shadow-sm border">
                            <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2">
                              <CreditCard size={16} className="text-red-500" />
                              Summary
                            </h3>
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Method:</span>
                                <span className="font-semibold text-gray-900">
                                  {order.paymentMethod}
                                </span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-600">Status:</span>
                                <span
                                  className={`px-2 py-0.5 rounded text-xs font-semibold ring-1 ${getPaymentStatusColor(
                                    order.paymentStatus
                                  )}`}
                                >
                                  {order.paymentStatus}
                                </span>
                              </div>
                              <div className="flex justify-between border-t pt-2 mt-2">
                                <span className="text-gray-600 flex items-center gap-1">
                                  <Calendar size={14} /> Expected Delivery:
                                </span>
                                <span className="font-semibold text-gray-900">
                                  {
                                    formatDate(order.expectedDelivery).split(
                                      ","
                                    )[0]
                                  }
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                        {/* Uncomment this button if you want to handle overall order status update (instead of per-product) */}
                        {/* <button
                        onClick={() => handleUpdateStatus(order)}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors shadow-md"
                      >
                        Update Order Status
                      </button> */}
                        <button
                          onClick={() => handleViewDetails(order)}
                          className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
                        >
                          <Eye size={16} /> View Details / Invoice
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
          ) : (
            <div className="text-center p-10 bg-white rounded-xl shadow-lg border border-gray-100">
              <p className="text-gray-600 text-lg">No orders found.</p>
            </div>
          )}
        </div>
      </div>

      {/* --- Modals --- */}

      {openModal && (
        <VendorReturnStatusModal
          item={products}
          orderId={currentOrderId}
          setOpenModal={setOpenModal}
          onUpdate={updateReturnStatus}
        />
      )}

      {/* Update Status Modal (Overall Order Status) - If used */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                Update Order Status
              </h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 space-y-2 border-b pb-4">
                <p className="text-sm text-gray-600">
                  Order ID:{" "}
                  <span className="font-medium text-gray-900">
                    #{selectedOrder?.orderId}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Status:{" "}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ring-1 ${getStatusColor(
                      selectedOrder?.orderStatus
                    )}`}
                  >
                    {selectedOrder?.orderStatus}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select New Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  {statusOptions.map((status) => (
                    <option
                      key={status}
                      value={status}
                      disabled={status === selectedOrder?.orderStatus}
                    >
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedOrder._id)}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                disabled={
                  !selectedStatus ||
                  selectedStatus === selectedOrder?.orderStatus
                }
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Individual Product Status Handling Modal */}
      {showProductDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between p-5 border-b">
              <h2 className="text-lg font-bold text-gray-900">
                Update Product Status
              </h2>
              <button
                onClick={() => setShowProdectDetailsModel(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4 space-y-2 border-b pb-4">
                <p className="text-sm text-gray-600">
                  Product:{" "}
                  <span className="font-medium text-gray-900">
                    {products.productID?.name}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Status:{" "}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-semibold ring-1 ${getStatusColor(
                      products.status
                    )}`}
                  >
                    {products.status}
                  </span>
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Next Status
                </label>
                <select
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="">Select new status</option>
                  {getNextStatuses(products.status).map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl">
              <button
                onClick={() => setShowProdectDetailsModel(false)}
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                onClick={() =>
                  HandleUpdateProductStatus(currentOrderId, products)
                }
                disabled={
                  !selectedStatus || selectedStatus === products?.status
                }
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details/Invoice Modal */}
      {selectedOrder && showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full my-8 flex flex-col max-h-[90vh]">
            <div className="flex px-6 py-4 items-center justify-between border-b sticky top-0 bg-white z-10 rounded-t-xl">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Eye size={20} className="text-blue-600" />
                Order Details{" "}
                <span className="text-sm text-gray-500 font-normal">
                  #{selectedOrder.orderId}
                </span>
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto" ref={printRef}>
              {/* Invoice Title for Print */}
              <div className="hidden print:block text-center mb-4">
                <h1 className="text-2xl font-bold">INVOICE</h1>
                <p className="text-sm text-gray-600">
                  For Order: #{selectedOrder?.orderId}
                </p>
              </div>

              {/* Order Info */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg border border-gray-200 header-info">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-semibold text-gray-900">
                    #{selectedOrder?.orderId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Order Date</p>
                  <p className="text-sm font-medium text-gray-900">
                    {formatDate(selectedOrder?.createdAt)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Method</p>
                  <p className="text-sm font-medium text-gray-900">
                    {selectedOrder?.paymentMethod}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Payment Status</p>
                  <span
                    className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ring-1 ${getPaymentStatusColor(
                      selectedOrder?.paymentStatus
                    )}`}
                  >
                    {selectedOrder?.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Details & Address */}
              <div className="grid md:grid-cols-2 gap-6 section">
                <div>
                  <h3 className="text-base font-bold text-gray-900 mb-3 border-b pb-2">
                    Customer & Shipping Details
                  </h3>
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm border">
                    <p>
                      <span className="text-gray-600">Name:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {selectedOrder?.shippingAddress.fullName}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Phone:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {selectedOrder?.shippingAddress.phone}
                      </span>
                    </p>
                    <p>
                      <span className="text-gray-600">Address:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {selectedOrder?.shippingAddress.addressLine},{" "}
                        {selectedOrder?.shippingAddress.city},{" "}
                        {selectedOrder?.shippingAddress.state} -{" "}
                        {selectedOrder?.shippingAddress.pincode}
                      </span>
                    </p>
                    {selectedOrder?.shippingAddress.landmark && (
                      <p>
                        <span className="text-gray-600">Landmark:</span>{" "}
                        <span className="font-medium text-gray-900">
                          {selectedOrder?.shippingAddress.landmark}
                        </span>
                      </p>
                    )}
                  </div>
                </div>

                {/* Coupon Info in Details Modal */}
                <div className="flex flex-col">
                  <h3 className="text-base font-bold text-gray-900 mb-3 border-b pb-2">
                    Delivery & Status
                  </h3>
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg flex-grow space-y-2">
                    <p className="text-sm text-blue-900">
                      <strong>Expected Delivery:</strong>{" "}
                      {formatDate(selectedOrder?.expectedDelivery)}
                    </p>
                    <p className="text-sm text-blue-900">
                      <strong>Current Status:</strong>{" "}
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-semibold ring-1 ${getStatusColor(
                          selectedOrder?.orderStatus
                        )}`}
                      >
                        {selectedOrder?.orderStatus}
                      </span>
                    </p>
                    {selectedOrder?.coupon && selectedOrder?.coupon.applied && (
                      <div className="border-t pt-2 mt-2">
                        <p className="text-xs text-purple-600 uppercase font-bold tracking-wider flex items-center gap-1">
                          <Tag size={14} /> COUPON APPLIED
                        </p>
                        <p className="text-sm font-mono text-purple-900">
                          {selectedOrder?.coupon.code || "N/A"}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Products Table */}
              <div className="section">
                <h3 className="text-base font-bold text-gray-900 mb-3">
                  Ordered Products
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="min-w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600 w-1/3">
                          Product
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
                          Flavour
                        </th>
                        <th className="px-4 py-2 text-center text-xs font-medium text-gray-600">
                          Qty
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                          Price
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-gray-600">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {selectedOrder?.orderedItems.map((item) => (
                        <tr
                          key={item._id}
                          className="hover:bg-gray-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">
                            {item?.productID?.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item?.flavour}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {item?.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            ₹{item.price.toLocaleString("en-IN")}
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                            ₹
                            {(item.price * item.quantity).toLocaleString(
                              "en-IN"
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Summary - Enhanced for better visual/print separation */}
              <div className="flex justify-end pt-4 summary">
                <div className="w-full sm:w-80 space-y-2 p-4 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between text-sm summary-row">
                    <span className="text-gray-600 summary-label">
                      Subtotal:
                    </span>
                    <span className="font-medium text-gray-900 summary-value">
                      ₹{selectedOrder?.totalPrice.toLocaleString("en-IN")}
                    </span>
                  </div>
                  {selectedOrder?.discount > 0 && (
                    <div className="flex justify-between text-sm summary-row">
                      <span className="text-gray-600 summary-label">
                        Discount:
                      </span>
                      <span className="font-medium text-green-600 summary-value text-green">
                        -₹{selectedOrder?.discount.toLocaleString("en-IN")}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold pt-3 border-t-2 border-gray-900 summary-row summary-total">
                    <span className="text-gray-900 summary-label">
                      Total Amount:
                    </span>
                    <span className="text-gray-900 summary-value">
                      ₹{selectedOrder?.finalAmount.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer (Action Buttons) */}
            <div className="flex gap-3 p-4 border-t bg-gray-50 rounded-b-xl sticky bottom-0 z-10">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button
                onClick={handlePrint}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2 shadow-md"
              >
                <i className="lucide lucide-printer" />
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
