import React from "react";
import Navbar from "../../components/admin/Navbar";
import Panel from "../../components/admin/Panel";
import { Outlet, useLocation } from "react-router-dom";

const Dashboard = () => {
  const location = useLocation();
  const isDashboardHome =
    location.pathname === "/admin/dashboard"

  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64">
          <Panel />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          {isDashboardHome ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Welcome Back, Admin! 👋
                </h1>
                <p className="text-lg text-gray-600 mb-8">
                  Ready to manage your dashboard
                </p>
                <div className="grid grid-cols-3 gap-6 max-w-3xl mx-auto mt-12">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl mb-2">📊</div>
                    <h3 className="text-xl font-semibold mb-1">Analytics</h3>
                    <p className="text-sm opacity-90">View your stats</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl mb-2">🛍️</div>
                    <h3 className="text-xl font-semibold mb-1">Products</h3>
                    <p className="text-sm opacity-90">Manage inventory</p>
                  </div>
                  <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl mb-2">👥</div>
                    <h3 className="text-xl font-semibold mb-1">Users</h3>
                    <p className="text-sm opacity-90">User management</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
