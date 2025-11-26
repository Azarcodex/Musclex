import React, { useState } from "react";
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
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showProductDetailsModal, setShowProdectDetailsModel] = useState(false);
  const [products, setProducts] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [currentOrderId, setCurrentOrderId] = useState(null);
  const { mutate: updateReturnStatus } = useReturnOrderStatus();
  const { data: orders } = useGetOrdersList();
  //update status
  const { mutate: UpdateStatus } = useUpdateStatus();
  const { mutate: UpdateProductStatus } = useUpdateProductStatus();
  console.log(orders?.message);

  const toggleExpand = (orderId) => {
    setExpandedOrder(expandedOrder === orderId ? null : orderId);
  };

  // const handleUpdateStatus = (order) => {
  //   setSelectedOrder(order);
  //   setSelectedStatus(order.orderedItems[0].status);
  //   setShowStatusModal(true);
  // };

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
    setShowDetailsModal(true);
    console.log(selectedOrder);
  };
  const [openModal, setOpenModal] = useState(false);

  const openReturnModal = (orderId, item) => {
    setCurrentOrderId(orderId);
    setProducts(item);
    setOpenModal(true);
  };

  const HandleSingleProduct = (id, item) => {
    setProducts(item);
    setCurrentOrderId(id);
    setShowProdectDetailsModel(true);
  };
  const HandleUpdateProductStatus = (orderId, item) => {
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

  const getPaymentStatusColor = (status) => {
    return status === "Paid"
      ? "bg-green-100 text-green-800"
      : "bg-orange-100 text-orange-800";
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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Orders Management
          </h1>
          <p className="text-gray-600 mt-1">View and manage all your orders</p>
        </div>

        <div className="space-y-4">
          {orders?.message?.map((order) => (
            <div
              key={order._id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              {/* Order Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4 flex-wrap">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">
                        {order.orderId}
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {formatDate(order.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          order.orderStatus
                        )}`}
                      >
                        {order.orderStatus}
                      </span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getPaymentStatusColor(
                          order.paymentStatus
                        )}`}
                      >
                        {order.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        ₹{order.finalAmount.toLocaleString()}
                      </p>
                      {order.discount > 0 && (
                        <p className="text-xs text-gray-500 line-through">
                          ₹{order.totalPrice.toLocaleString()}
                        </p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleExpand(order._id)}
                      className="p-2 hover:bg-gray-200 rounded-full transition-colors"
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
                <div className="p-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-6">
                      {/* Ordered Items */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Package size={16} />
                          Ordered Items
                        </h3>
                        <div className="space-y-3">
                          {order.orderedItems.map((item) => (
                            <div
                              key={item._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div>
                                <p className="text-sm font-medium text-gray-900">
                                  {item?.productID?.name}
                                </p>
                                <p className="text-xs text-gray-500 mt-0.5">
                                  {item.flavour} • Qty: {item.quantity}
                                </p>
                              </div>
                              <p className="text-sm font-semibold text-gray-900">
                                ₹{item.price.toLocaleString()}
                              </p>
                              {item.status === "Returned" ? (
                                <span
                                  onClick={() =>
                                    openReturnModal(order._id, item)
                                  }
                                  className="text-xs px-1.5 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-700 cursor-pointer"
                                >
                                  return status
                                </span>
                              ) : (
                                order.orderStatus !== "Cancelled" &&
                                item.status !== "Cancelled" && (
                                  <div className="flex items-center gap-6">
                                    <span
                                      className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                        item.status
                                      )}`}
                                    >
                                      {item.status}
                                    </span>

                                    <span
                                      className="text-xs px-1.5 py-1 rounded-md bg-blue-500 text-white hover:bg-blue-700 cursor-pointer"
                                      onClick={() =>
                                        HandleSingleProduct(order._id, item)
                                      }
                                    >
                                      update status
                                    </span>
                                  </div>
                                )
                              )}

                              {/* {order.orderStatus !== "Cancelled"&&item.status!=="Cancelled" && (
                                <div className="flex items-center gap-6">
                                  <span
                                    className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                                      item.status
                                    )}`}
                                  >
                                    {item.status}
                                  </span>

                                  <span
                                    className="text-xs px-1.5 py-1 rounded-md bg-blue-500 text-white  hover:bg-blue-700 cursor-pointer"
                                    onClick={() =>
                                      HandleSingleProduct(order._id, item)
                                    }
                                  >
                                    update status
                                  </span>
                                </div>
                              )} */}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Payment Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <CreditCard size={16} />
                          Payment Information
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Method:</span>
                            <span className="font-medium text-gray-900">
                              {order.paymentMethod}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Status:</span>
                            <span
                              className={`px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(
                                order.paymentStatus
                              )}`}
                            >
                              {order.paymentStatus}
                            </span>
                          </div>
                          {order.discount > 0 && (
                            <div className="flex justify-between text-sm pt-2 border-t">
                              <span className="text-gray-600">Discount:</span>
                              <span className="font-medium text-green-600">
                                -₹{order.discount}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-6">
                      {/* Shipping Address */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <MapPin size={16} />
                          Shipping Address
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <p className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            <User size={14} />
                            {order.shippingAddress.fullName}
                          </p>
                          <p className="text-sm text-gray-600 mt-2">
                            {order.shippingAddress.addressLine}
                          </p>
                          {order.shippingAddress.landmark && (
                            <p className="text-sm text-gray-600">
                              Landmark: {order.shippingAddress.landmark}
                            </p>
                          )}
                          <p className="text-sm text-gray-600">
                            {order.shippingAddress.city},{" "}
                            {order.shippingAddress.state} -{" "}
                            {order.shippingAddress.pincode}
                          </p>
                          <p className="text-sm text-gray-900 mt-2 flex items-center gap-2">
                            <Phone size={14} />
                            {order.shippingAddress.phone}
                          </p>
                        </div>
                      </div>

                      {/* Delivery Info */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                          <Calendar size={16} />
                          Delivery Information
                        </h3>
                        <div className="bg-gray-50 rounded-lg p-4">
                          <div className="flex justify-between text-sm mb-2">
                            <span className="text-gray-600">
                              Expected Delivery:
                            </span>
                            <span className="font-medium text-gray-900">
                              {formatDate(order.expectedDelivery)}
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Last Updated:</span>
                            <span className="font-medium text-gray-900">
                              {formatDate(order.updatedAt)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 mt-6 pt-6 border-t">
                    {/* <button
                      onClick={() => handleUpdateStatus(order)}
                      className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      Update Status
                    </button> */}
                    <button
                      onClick={() => handleViewDetails(order)}
                      className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                    >
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg text-sm font-medium transition-colors">
                      Print Invoice
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {openModal && (
            <VendorReturnStatusModal
              item={products}
              orderId={currentOrderId}
              setOpenModal={setOpenModal}
              onUpdate={updateReturnStatus}
            />
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Update Order Status
              </h2>
              <button
                onClick={() => setShowStatusModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  Order ID:{" "}
                  <span className="font-medium text-gray-900">
                    {selectedOrder?.orderId}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Status:{" "}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      selectedOrder?.orderedItems[0].status
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Changing the order status will notify
                  the customer via email and SMS.
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowStatusModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedOrder._id)}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/*Individual product status handling */}
      {showProductDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h2 className="text-lg font-semibold text-gray-900">
                Update Order Status
              </h2>
              <button
                onClick={() => setShowProdectDetailsModel(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">
                  product:{" "}
                  <span className="font-medium text-gray-900">
                    {products.productID?.name}
                  </span>
                </p>
                <p className="text-sm text-gray-600">
                  Current Status:{" "}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      products.status
                    )}`}
                  >
                    {products.status}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {statusOptions.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </div>

              {/* <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs text-blue-800">
                  <strong>Note:</strong> Changing the order status will notify
                  the customer via email and SMS.
                </p>
              </div> */}
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowProdectDetailsModel(false)}
                className="flex-1 px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                // onClick={() => handleStatusUpdate(selectedOrder._id)}
                className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                onClick={() =>
                  HandleUpdateProductStatus(currentOrderId, products)
                }
              >
                Update Status
              </button>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showDetailsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50  overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full ">
            <div className="flex px-2 items-center justify-between border-b sticky top-0 bg-white z-50">
              <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <Eye size={20} />
                Order Details
              </h2>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Order Info */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-xs text-gray-500">Order ID</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {selectedOrder?.orderId}
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
                    className={`inline-block px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(
                      selectedOrder?.paymentStatus
                    )}`}
                  >
                    {selectedOrder?.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Details */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Customer Details
                </h3>
                <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                  <p className="text-sm">
                    <span className="text-gray-600">Name:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {selectedOrder?.shippingAddress.fullName}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Phone:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {selectedOrder?.shippingAddress.phone}
                    </span>
                  </p>
                  <p className="text-sm">
                    <span className="text-gray-600">Address:</span>{" "}
                    <span className="font-medium text-gray-900">
                      {selectedOrder?.shippingAddress.addressLine},{" "}
                      {selectedOrder?.shippingAddress.city},{" "}
                      {selectedOrder?.shippingAddress.state} -{" "}
                      {selectedOrder?.shippingAddress.pincode}
                    </span>
                  </p>
                  {selectedOrder?.shippingAddress.landmark && (
                    <p className="text-sm">
                      <span className="text-gray-600">Landmark:</span>{" "}
                      <span className="font-medium text-gray-900">
                        {selectedOrder?.shippingAddress.landmark}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              {/* Products */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  Ordered Products
                </h3>
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-600">
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
                        <tr key={item._id}>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {item?.productID?.name}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {item?.variantID?.flavour}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-center">
                            {item?.quantity}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">
                            ₹{item.price.toLocaleString()}
                          </td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">
                            ₹{(item.price * item.quantity).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Price Summary */}
              <div className="border-t pt-4">
                <div className="flex justify-end">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="font-medium text-gray-900">
                        ₹{selectedOrder?.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    {selectedOrder?.discount > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Discount:</span>
                        <span className="font-medium text-green-600">
                          -₹{selectedOrder?.discount.toLocaleString()}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-base font-semibold pt-2 border-t">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">
                        ₹{selectedOrder?.finalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Info */}
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-900">
                  <strong>Expected Delivery:</strong>{" "}
                  {formatDate(selectedOrder?.expectedDelivery)}
                </p>
                <p className="text-sm text-blue-900 mt-1">
                  <strong>Current Status:</strong>{" "}
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${getStatusColor(
                      selectedOrder?.orderedItems[0].status
                    )}`}
                  >
                    {selectedOrder?.orderedItems[0].status}
                  </span>
                </p>
              </div>
            </div>

            <div className="flex gap-3 p-4 border-t bg-gray-50">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 hover:bg-gray-100 text-gray-700 rounded-lg text-sm font-medium transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors">
                Print Invoice
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
