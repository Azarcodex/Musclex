import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { DollarSign, TrendingUp, Package, ShoppingBag } from "lucide-react";
import { useDashboardAnalytics } from "../../hooks/admin/useAdminDashboard";

const COLORS = ["#7c3aed", "#a855f7", "#c084fc", "#e9d5ff"];

const DashboardAnalytics = () => {
  const [timeframe, setTimeframe] = useState("weekly");
  const { data, isLoading, isError } = useDashboardAnalytics();

  if (isLoading) return <div className="p-6">Loading dashboard...</div>;
  if (isError)
    return <div className="p-6 text-red-500">Failed to load dashboard</div>;

  /* ---------------- CHART DATA ---------------- */
  const chartSource = data.chartData[timeframe];

  const revenueChartData =
    timeframe === "yearly"
      ? chartSource.map((y) => ({
          name: y._id.toString(),
          revenue: y.grossRevenue,
        }))
      : chartSource.labels.map((label, i) => ({
          name: label,
          revenue: chartSource.data[i],
        }));

  /* ---------------- CATEGORY PIE ---------------- */
  const categoryPieData = data.topCategories.map((c) => ({
    name: c.categoryName,
    value: c.grossRevenue,
  }));

  /* ---------------- SUMMARY CARDS ---------------- */
  const summaryCards = [
    {
      title: "Platform Revenue",
      value: `₹${data.summary.grossAmount}`,
      icon: DollarSign,
    },
    {
      title: "Admin Earnings",
      value: `₹${data.summary.adminAmount}`,
      icon: TrendingUp,
    },
    {
      title: "Vendor Payout",
      value: `₹${data.summary.vendorAmount}`,
      icon: Package,
    },
    {
      title: "Top Category",
      value: data.topCategories[0]?.categoryName || "-",
      icon: ShoppingBag,
    },
  ];

  return (
    <div className="min-h-screen bg-purple-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* HEADER */}
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-600">Platform analytics overview</p>
        </div>

        {/* SUMMARY */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {summaryCards.map((s, i) => (
            <div key={i} className="bg-white rounded-xl shadow p-5">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500">{s.title}</p>
                  <p className="text-2xl font-bold mt-2">{s.value}</p>
                </div>
                <s.icon className="text-purple-600" size={36} />
              </div>
            </div>
          ))}
        </div>

        {/* REVENUE CHART */}
        <div className="bg-white rounded-xl shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Revenue Trend</h2>
            <div className="flex gap-2">
              {["weekly", "monthly", "yearly"].map((tf) => (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`px-3 py-1 rounded-lg text-sm font-medium ${
                    timeframe === tf
                      ? "bg-purple-600 text-white"
                      : "bg-purple-100 text-purple-600"
                  }`}
                >
                  {tf}
                </button>
              ))}
            </div>
          </div>

          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Line
                dataKey="revenue"
                stroke="#7c3aed"
                strokeWidth={3}
                dot={{ r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* CATEGORY PIE */}
        <div className="bg-white rounded-xl shadow p-6">
          <h2 className="text-lg font-bold mb-4">Revenue by Category</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryPieData}
                dataKey="value"
                outerRadius={100}
                label
              >
                {categoryPieData.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* TABLES */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* PRODUCTS */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold mb-4">Top Products</h2>
            {data.topProducts.map((p, i) => (
              <div
                key={i}
                className="flex justify-between py-2 border-b text-sm"
              >
                <span>{p.name}</span>
                <span>Sold: {p.totalSold}</span>
              </div>
            ))}
          </div>

          {/* CATEGORIES */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold mb-4">Top Categories</h2>
            {data.topCategories.map((c, i) => (
              <div
                key={i}
                className="flex justify-between py-2 border-b text-sm"
              >
                <span>{c.categoryName}</span>
                <span>₹{c.grossRevenue}</span>
              </div>
            ))}
          </div>

          {/* BRANDS */}
          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="font-bold mb-4">Top Vendors</h2>

            {data.topBrands.map((b, i) => (
              <div key={i} className="py-3 border-b text-sm">
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-800">
                    {b.shopName || "Unknown Vendor"}
                  </span>
                  <span className="font-semibold text-purple-600">
                    ₹{b.grossRevenue}
                  </span>
                </div>

                <div className="text-gray-500 mt-1 flex justify-between">
                  <span>Sold: {b.qtySold}</span>
                  <span>Admin: ₹{b.adminAmount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardAnalytics;
