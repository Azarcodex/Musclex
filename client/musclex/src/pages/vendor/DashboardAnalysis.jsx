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
import {
  LayoutDashboard,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Percent,
  Package,
} from "lucide-react";
import { useGetVendorDashboard } from "../../hooks/vendor/useGetDashboard";

// --- Helper Components ---
const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-purple-100 flex items-center space-x-4 transition hover:shadow-md">
    <div className={`p-3 rounded-full ${colorClass}`}>
      <Icon className="w-6 h-6 text-white" />
    </div>
    <div>
      <p className="text-sm text-gray-500 font-medium">{title}</p>
      <h3 className="text-2xl font-bold text-gray-800">{value}</h3>
    </div>
  </div>
);

const VendorDashboard = () => {
  const [timeframe, setTimeframe] = useState("weekly");

  // ✅ HOOK MUST BE HERE
  const { data, isLoading, isError } = useGetVendorDashboard();

  if (isLoading) {
    return <div className="p-6">Loading dashboard...</div>;
  }

  if (isError || !data) {
    return <div className="p-6 text-red-600">Failed to load dashboard</div>;
  }

  // ✅ SAFE DESTRUCTURING
  const summary = data.summary || {};
  const topProducts = data.topProducts || [];
  const chartData = data.chartData || {};

  const rawChart =
    timeframe === "weekly"
      ? chartData?.weekly?.weekly ?? []
      : timeframe === "monthly"
      ? chartData?.monthly?.monthly ?? []
      : chartData?.yearly?.yearly ?? [];

  const currentChartData = rawChart.map((item) => {
    let label = "";

    if (timeframe === "weekly") {
      const date = new Date(item._id + "T00:00:00");
      label = date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }

    if (timeframe === "monthly") {
      label = new Date(2025, item._id - 1, 1).toLocaleString("en-US", {
        month: "short",
      });
    }

    if (timeframe === "yearly") {
      label = item._id.toString();
    }

    return {
      name: label,
      profit: Number(item.profit ?? 0),
    };
  });

  const formatCurrency = (amount = 0) => `₹${amount.toLocaleString()}`;

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-purple-900">
            Vendor Dashboard
          </h1>
          <p className="text-slate-500 mt-1">
            Welcome back! Here is your store overview.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      {/* <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(summary.totalRevenue)}
          icon={DollarSign}
          colorClass="bg-purple-500"
        />
        <StatCard
          title="Total Profit"
          value={formatCurrency(summary.totalProfit)}
          icon={TrendingUp}
          colorClass="bg-emerald-500"
        />
        <StatCard
          title="Total Orders"
          value={summary.totalOrders || 0}
          icon={ShoppingBag}
          colorClass="bg-blue-500"
        />
        <StatCard
          title="Total Commission"
          value={formatCurrency(summary.totalCommission)}
          icon={Percent}
          colorClass="bg-orange-400"
        />
      </div> */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Chart Section */}
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

          <div className="h-[300px] w-full">
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
                      {product.productName || product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {product.totalSold} sold
                    </p>
                  </div>
                </div>
                <span className="font-bold text-purple-700">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default VendorDashboard;
