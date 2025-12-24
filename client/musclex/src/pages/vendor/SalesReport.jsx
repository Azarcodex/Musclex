import React, { useState } from "react";
import {
  Package,
  TrendingUp,
  DollarSign,
  ShoppingCart,
  TrendingDown,
} from "lucide-react";

import { useGetSalesReport } from "../../hooks/vendor/useGetSalesReport";
import api from "../../api/axios";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

export default function SalesReport() {
  const navigate = useNavigate();
  // --- Pagination Setup ---
  const [page, setPage] = useState(1);

  // --- Filter States ---
  const [quickFilter, setQuickFilter] = useState("");
  const [dateRange, setDateRange] = useState({
    from: "",
    to: "",
  });

  // Filter object sent to the API hook
  const [filter, setFilter] = useState({ type: "none" });

  // --- Filter Handlers ---

  // Handle quick filters
  const handleQuickFilter = (value) => {
    setQuickFilter(value);

    // Reset pagination to page 1 on filter change
    setPage(1);

    if (value === "1day") {
      setFilter({ type: "day" });
    } else if (value === "1week") {
      setFilter({ type: "week" });
    } else if (value === "1month") {
      setFilter({ type: "month" });
    } else if (value === "range") {
      // Keep filter type as 'none' until the user applies the range
      setFilter({ type: "none" });
    } else {
      setFilter({ type: "none" }); // For 'All Time' or default
    }
  };

  // Apply Custom Range
  const applyCustomRange = () => {
    if (!dateRange.from || !dateRange.to) {
      alert("Select a valid date range.");
      return;
    }
    setPage(1); // Reset pagination
    setFilter({
      type: "range",
      from: dateRange.from,
      to: dateRange.to,
    });
  };

  const { data } = useGetSalesReport(page, filter);
  console.log(data);

  // Using totalVendorEarning as the final revenue for the vendor
  const totalRevenue = data?.summary?.totalVendorEarning || 0;
  const totalDiscount = data?.summary?.totalCouponDiscount;
  const totalProducts = data?.summary?.totalQty || 0;
  // Total orders is the number of items in the current page's array
  const totalOrders = data?.pagination?.totalItems || 0;
  const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  // --- Pagination Handlers (Adjusted property names) ---

  const HandleNext = () => {
    if (page < data?.pagination?.totalPages) {
      setPage((prev) => prev + 1);
    }
  };
  const HandlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  // --- Utility Functions ---

  // Helper function to format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date)) return "Invalid Date";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  // Helper function to format currency (Indian Rupees)
  const formatCurrency = (amount) => {
    const value = parseFloat(amount) || 0;
    return value.toLocaleString("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    });
  };

  // --- Excel Download ---
  const downloadExcel = async () => {
    try {
      const response = await api.post(
        "/api/vendor/sales-report/excel",
        { filter }, // send filter body
        { responseType: "blob" }
      );

      // Create blob link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "sales_report.xlsx");
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.log("Excel download error:", error);
      toast.error("Failed to download sales report.");
    }
  };
  //pdf download

  // const downloadPdf = async () => {
  //   const res = await api.post(
  //     "/api/vendor/sales-report/pdf",
  //     { filter: filter },
  //     { responseType: "blob" }
  //   );

  //   const url = window.URL.createObjectURL(new Blob([res.data]));
  //   const link = document.createElement("a");
  //   link.href = url;
  //   link.setAttribute("download", "sales-report.pdf");
  //   document.body.appendChild(link);
  //   link.click();
  // };

  const handlePrintPage = () => {
    navigate("/vendor/sales-report/print", {
      state: data, // pass full response
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header and Download Button */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">
            📊 Sales Report Dashboard
          </h1>
          <div className="flex items-center gap-2">
            <button
              onClick={downloadExcel}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200 text-sm"
            >
              Download Excel
            </button>
            <button
              onClick={handlePrintPage}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg shadow-md transition-colors duration-200 text-sm"
            >
              Download pdf
            </button>
          </div>
        </div>
        <p className="text-slate-600 mb-8">
          Track your sales performance and revenue metrics.
        </p>

        {/* --- Stats Cards --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          {/* Total Revenue Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1 font-medium">
              Total Vendor Earning (Final)
            </p>
            <p className="text-3xl font-extrabold text-slate-800">
              {formatCurrency(totalRevenue)}
            </p>
          </div>

          {/* Total Orders Card (Total Items in current filter) */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1 font-medium">
              Total Orders
            </p>
            <p className="text-3xl font-extrabold text-slate-800">
              {totalOrders}
            </p>
          </div>

          {/* Products Sold Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1 font-medium">
              Products Sold (Qty)
            </p>
            <p className="text-3xl font-extrabold text-slate-800">
              {totalProducts.toLocaleString()}
            </p>
          </div>

          {/* Avg Order Value Card */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1 font-medium">
              Avg Order Value
            </p>
            <p className="text-3xl font-extrabold text-slate-800">
              {formatCurrency(avgOrderValue)}
            </p>
          </div>

          {/*total discount */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200 hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-start justify-between mb-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <TrendingDown className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-slate-600 text-sm mb-1 font-medium">Discount</p>
            <p className="text-3xl font-extrabold text-slate-800">
              {formatCurrency(totalDiscount)}
            </p>
          </div>
        </div>

        {/* --- Orders Table & Filters --- */}
        <div className="bg-white rounded-xl shadow-lg border border-slate-200 overflow-hidden">
          {/* Filters Section */}
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-semibold text-slate-800">
              Recent Orders
            </h2>
            <div className="flex items-center gap-3">
              {/* Quick Filters Dropdown */}
              <select
                className="border border-slate-300 px-3 py-2 rounded-lg text-sm bg-white focus:ring-purple-500 focus:border-purple-500"
                value={quickFilter}
                onChange={(e) => handleQuickFilter(e.target.value)}
              >
                <option value="">All Time</option>
                <option value="1day">Last 1 Day</option>
                <option value="1week">Last 7 Days</option>
                <option value="1month">Last 30 Days</option>
                <option value="range">Custom Date Range</option>
              </select>

              {/* Custom Date Range Inputs */}
              {quickFilter === "range" && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateRange.from}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, from: e.target.value })
                    }
                    className="border border-slate-300 px-3 py-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                  <span className="text-slate-600">to</span>
                  <input
                    type="date"
                    value={dateRange.to}
                    onChange={(e) =>
                      setDateRange({ ...dateRange, to: e.target.value })
                    }
                    className="border border-slate-300 px-3 py-2 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
                  />
                  <button
                    onClick={applyCustomRange}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm transition-colors duration-200"
                  >
                    Apply
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Orders Table */}
          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Order Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Customer
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Product
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Payment Method
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Price/Unit (Original)
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Total Revenue
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Discount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Commission Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Vendor Earning (Final)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.orders?.length > 0 ? (
                  data.orders.map((order, index) => {
                    // Calculate the original price per unit from the `price` field in the order object
                    const originalPricePerUnit = order.price / order.quantity;
                    // Calculate the total price before commission/discount from the `originalTotal` field
                    const totalOriginalRevenue = order.originalTotal;
                    // Use couponDiscount from the order object
                    const couponDiscount = order.couponDiscount || 0;
                    // Calculate the total after coupon discount (customer's final payment)
                    const totalFinal = totalOriginalRevenue - couponDiscount;
                    // Use vendorEarning from the order object as the final earning
                    const finalVendorEarning = order.vendorEarning || 0;

                    const commissionAmount = order.commissionAmount || 0;

                    return (
                      <tr
                        key={order.rowKey}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {(data?.pagination?.current - 1) * 10 + index + 1}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          {formatDate(order.orderDate)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-slate-900">
                          {order.customerName}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">
                          <div className="font-medium text-slate-800">
                            {order.productName}
                          </div>
                          <div className="text-xs text-slate-500 capitalize">
                            {order.flavour} / {order.sizeLabel}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-bold text-center">
                          {order.quantity}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600 font-bold text-center">
                          {order.paymentMethod}
                        </td>
                        {/* Original Price/Unit */}
                        <td className="px-6 py-4 text-sm text-slate-600 text-right">
                          {formatCurrency(originalPricePerUnit)}
                        </td>
                        {/* Total Revenue (Original Total) */}
                        <td className="px-6 py-4 text-sm font-medium text-slate-700 text-right">
                          {formatCurrency(totalOriginalRevenue)}
                        </td>
                        {/* Discount */}
                        <td className="px-6 py-4 text-sm text-red-600 font-medium text-right">
                          - {formatCurrency(couponDiscount)}
                        </td>
                        <td className="px-6 py-4 text-sm text-red-600 font-medium text-right">
                          - {formatCurrency(commissionAmount)}
                        </td>
                        {/* Vendor Earning (Final) */}
                        <td className="px-6 py-4 text-sm font-semibold text-green-700 text-right bg-green-50">
                          {formatCurrency(finalVendorEarning)}
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan="10" // Adjusted colSpan
                      className="px-6 py-10 text-center text-slate-500"
                    >
                      No orders found for the current selection.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-4 justify-end p-4 border-t border-slate-200">
            <span className="text-sm text-slate-600">
              Page {data?.pagination?.current || 0} of
              {data?.pagination?.totalPages || 0}
            </span>
            <button
              onClick={HandlePrev}
              disabled={page <= 1}
              className="px-3 py-1 bg-purple-100 text-purple-600 border border-purple-300 rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-200 transition-colors"
            >
              Previous
            </button>
            <button
              onClick={HandleNext}
              disabled={page >= (data?.pagination?.totalPages || 0)}
              className="px-3 py-1 bg-purple-600 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-700 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
