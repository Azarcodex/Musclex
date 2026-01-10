import React, { useEffect } from "react";
import { useParams } from "react-router-dom";
import { Printer, ArrowLeft, Tag, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetSingleOrder } from "../../hooks/users/useGetSingleOrderInvoice";

export default function InvoicePage() {
  const { orderId } = useParams();

  const navigate = useNavigate();

  const { data, isLoading, isError } = useGetSingleOrder(orderId);
  console.log(data);
  const order = data?.message || null;
  const formatDate = (date) =>
    new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  if (isLoading)
    return (
      <div className="p-10 text-center text-gray-600">Loading Invoice...</div>
    );

  if (isError)
    return (
      <div className="p-10 text-center text-red-600">
        Failed to load invoice.
      </div>
    );
  if (!order)
    return <div className="p-10 text-center text-red-600">No order found</div>;

  return (
    <div className="min-h-screen bg-gray-50 p-6 print:p-0">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 print:shadow-none print:p-4">
        {/* Top Actions */}
        <div className="flex justify-between items-center mb-6 print:hidden">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-700 hover:text-black"
          >
            <ArrowLeft size={18} /> Back
          </button>

          <button
            onClick={() => window.print()}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-purple-700"
          >
            <Printer size={18} /> Print
          </button>
        </div>

        {/* Invoice Header */}
        <div className="text-center mb-6">
          <h1 className="text-3xl font-extrabold text-gray-900">INVOICE</h1>
          <p className="text-gray-500 mt-1">Order #{order.orderId}</p>
        </div>

        {/* Order Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
          <div className="border p-4 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">Order Information</h3>
            <p className="text-sm">
              <span className="text-gray-600">Order Date: </span>
              {formatDate(order.createdAt)}
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Expected Delivery: </span>
              {formatDate(order.expectedDelivery)}
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Payment Method: </span>
              {order.paymentMethod}
            </p>
            <p className="text-sm">
              <span className="text-gray-600">Payment Status: </span>
              {order.paymentStatus}
            </p>
            {order.couponApplied && (
              <div className="mt-2 bg-purple-50 border border-purple-200 rounded p-2 flex items-center gap-2">
                <Tag size={16} className="text-purple-600" />
                <span className="text-sm text-purple-900">
                  Coupon Applied: {order.couponCode}
                </span>
                <Check size={14} className="text-purple-600" />
              </div>
            )}
          </div>

          <div className="border p-4 rounded-lg">
            <h3 className="font-bold text-gray-900 mb-2">
              Billing / Shipping Address
            </h3>
            <p className="text-sm font-semibold text-gray-900">
              {order.shippingAddress.fullName}
            </p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.addressLine}
            </p>
            <p className="text-sm text-gray-600">
              {order.shippingAddress.city}, {order.shippingAddress.state} -{" "}
              {order.shippingAddress.pincode}
            </p>
            <p className="text-sm text-gray-600">
              Phone: {order.shippingAddress.phone}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <div className="border rounded-lg overflow-hidden mb-8">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">
                  Product
                </th>
                <th className="text-left px-4 py-2 text-sm font-semibold text-gray-700">
                  Flavour
                </th>
                <th className="text-center px-4 py-2 text-sm font-semibold text-gray-700">
                  Qty
                </th>
                <th className="text-right px-4 py-2 text-sm font-semibold text-gray-700">
                  Price
                </th>
                <th className="text-right px-4 py-2 text-sm font-semibold text-gray-700">
                  Total
                </th>
              </tr>
            </thead>

            <tbody>
              {order.orderedItems.map((item) => (
                <tr key={item._id} className="border-t">
                  <td className="px-4 py-2 text-sm font-medium">
                    {item.productID?.name}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    {item.variantID?.flavour}
                  </td>
                  <td className="px-4 py-2 text-sm text-center">
                    {item.quantity}
                  </td>
                  <td className="px-4 py-2 text-sm text-right">
                    ₹{item.price.toLocaleString("en-IN")}
                  </td>
                  <td className="px-4 py-2 text-sm text-right font-semibold">
                    ₹{(item.price * item.quantity).toLocaleString("en-IN")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div className="flex justify-end">
          <div className="w-full sm:w-72 border rounded-lg p-4 bg-gray-50">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Subtotal</span>
              <span>₹{order.totalPrice.toLocaleString("en-IN")}</span>
            </div>

            {order.discount > 0 && (
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">
                  -₹{order.discount.toLocaleString("en-IN")}
                </span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold mt-2 pt-2 border-t">
              <span>Total Paid</span>
              <span>₹{order.finalAmount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
