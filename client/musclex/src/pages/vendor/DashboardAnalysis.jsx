import React, { useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ShoppingBag, TrendingUp, Package } from "lucide-react";
import { useGetVendorDashboard } from "../../hooks/vendor/useGetDashboard";

// ---------- Helper ----------
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center space-x-4">
    <div className={`p-3 rounded-full ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const VendorDashboard = () => {
  const [timeframe, setTimeframe] = useState("weekly");
  const { data, isLoading, isError } = useGetVendorDashboard();

  if (isLoading) return <div className="p-6">Loading dashboard...</div>;
  if (isError || !data)
    return <div className="p-6 text-red-600">Failed to load dashboard</div>;

  const summary = data.summary || {};
  const topProducts = data.topProducts || [];
  const chartData = data.chartData || {};

  // 🔑 CORRECT CHART DATA HANDLING
  let currentChartData = [];

  // WEEKLY (labels + data)
  if (timeframe === "weekly") {
    const labels = chartData?.weekly?.labels ?? [];
    const values = chartData?.weekly?.data ?? [];

    currentChartData = labels.map((label, index) => ({
      name: label,
      profit: Number(values[index] ?? 0),
    }));
  }

  // MONTHLY (array of objects)
  if (timeframe === "monthly") {
    currentChartData =
      chartData?.monthly?.monthly?.map((item) => ({
        name: new Date(2025, item.month - 1, 1).toLocaleString("en-US", {
          month: "short",
        }),
        profit: Number(item.netRevenue ?? 0),
      })) ?? [];
  }

  // YEARLY (array of objects)
  if (timeframe === "yearly") {
    currentChartData =
      chartData?.yearly?.yearly?.map((item) => ({
        name: item.year.toString(),
        profit: Number(item.netRevenue ?? 0),
      })) ?? [];
  }

  const formatCurrency = (amount = 0) => `₹${amount.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-purple-900">Vendor Dashboard</h1>
        <p className="text-slate-500 mt-1">
          Welcome back! Here is your store overview.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <StatCard
          title="Total Profit"
          value={formatCurrency(summary.totalProfit)}
          icon={TrendingUp}
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Total Sold"
          value={summary.totalSold || 0}
          icon={ShoppingBag}
          colorClass="bg-blue-500"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-800">
              Profit Analytics
            </h2>

            <div className="flex bg-purple-50 rounded-lg p-1">
              {["weekly", "monthly", "yearly"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md ${
                    timeframe === tf
                      ? "bg-white text-purple-700 shadow-sm"
                      : "text-gray-500 hover:text-purple-600"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={currentChartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke="#8b5cf6"
                  fill="#c4b5fd"
                  strokeWidth={3}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Top Products</h2>

          {topProducts.length === 0 ? (
            <p className="text-gray-400 text-center py-4">
              No products data yet.
            </p>
          ) : (
            topProducts.map((product, i) => (
              <div
                key={product._id || i}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-xl mb-3"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Package size={20} />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 capitalize">
                      {product.productName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.totalSold} sold
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
