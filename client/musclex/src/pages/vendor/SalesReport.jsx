import React, { useState } from "react";
import { Package, TrendingUp, DollarSign, ShoppingCart } from "lucide-react";
import { useGetSalesReport } from "../../hooks/vendor/useGetSalesReport";

export default function SalesReport() {
  //pagination setup
  const [page, setPage] = useState(1);

  const HandleNext = () => {
    if (page < data?.totalPage) {
      setPage((prev) => prev + 1);
    }
  };
  const HandlePrev = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };
  const { data } = useGetSalesReport(page);
  console.log(data);
  const avgOrderValue = data?.tactic?.totalRevenue / data?.tactic?.totalOrders;
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <button
          onClick={() =>
            window.open(
              `${import.meta.env.VITE_API_URL}/api/vendor/sales-report/excel`,
              "_blank"
            )
          }
          className="px-4 float-right  py-2 bg-green-600 text-white rounded"
        >
          Download Excel
        </button>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">
            Sales Report Dashboard
          </h1>
          <p className="text-slate-600">
            Track your sales performance and revenue
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Total Revenue</p>
            <p className="text-2xl font-bold text-slate-800">
              ₹{data?.tactic?.totalRevenue}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Total Orders</p>
            <p className="text-2xl font-bold text-slate-800">
              {data?.tactic?.totalOrders}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Products Sold</p>
            <p className="text-2xl font-bold text-slate-800">
              {data?.tactic?.totalProducts}
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1">Avg Order Value</p>
            <p className="text-2xl font-bold text-slate-800">
              ₹{avgOrderValue.toFixed(0)}
            </p>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200">
            <h2 className="text-xl font-semibold text-slate-800">
              Recent Orders
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Flavour
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Size
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {data?.orders?.map((order, index) => (
                  <tr
                    key={index}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {formatDate(order.orderDate)}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-900">
                      {order.customerName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                      {order.productName}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                      {order.flavour}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {order.sizeLabel}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      {order.quantity}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">
                      ₹{order.price.toLocaleString("en-IN")}
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-slate-900">
                      ₹{order.total.toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-3 justify-center mt-10">
        <button
          onClick={HandlePrev}
          className="border-2 p-2 border-purple-600 rounded-sm text-sm"
        >
          previous
        </button>
        <span>
          {data?.current} of {data?.totalPage}
        </span>
        <button
          onClick={HandleNext}
          className="border-2 p-2 border-purple-600 rounded-sm text-sm"
        >
          next
        </button>
      </div>
    </div>
  );
}
