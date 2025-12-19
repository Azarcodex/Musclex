import React from "react";
import VendorPanel from "../../components/vendor/VendorPanel";
import { Outlet, useLocation } from "react-router-dom";
import { Bell, LogOutIcon } from "lucide-react";
import { useDispatch } from "react-redux";
import { clearToken } from "../../store/features/vendorSlice";
import { useNavigate } from "react-router-dom";

const VendorDashboard = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();

  const isDashboardHome = location.pathname === "/vendor/dashboard";

  const handleLogout = () => {
    dispatch(clearToken());
    navigate("/vendor/login");
  };

  return (
    <div className="h-screen flex flex-col">
      {/* TOP BAR */}
      <div className="w-full bg-violet-600 flex items-center justify-between p-5">
        <h1 className="text-white font-extrabold text-4xl">MuscleX</h1>
        <div className="flex items-center gap-4">
          <Bell className="text-white" />
          <button onClick={handleLogout}>
            <LogOutIcon className="text-white" size={28} />
          </button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64">
          <VendorPanel />
        </div>

        <main className="flex-1 overflow-y-auto p-6 bg-gray-50">
          {isDashboardHome ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">
                  Welcome Back, Vendor 👋
                </h1>

                <p className="text-lg text-gray-600 mb-10">
                  Manage your store, products and orders from here
                </p>

                <div className="grid grid-cols-3 gap-6 max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl mb-2">📦</div>
                    <h3 className="text-xl font-semibold mb-1">
                      Manage Products
                    </h3>
                    <p className="text-sm opacity-90">
                      Add, edit and control listings
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl mb-2">🧾</div>
                    <h3 className="text-xl font-semibold mb-1">Orders</h3>
                    <p className="text-sm opacity-90">
                      Track and fulfill orders
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white p-6 rounded-xl shadow-lg">
                    <div className="text-3xl mb-2">📊</div>
                    <h3 className="text-xl font-semibold mb-1">Analytics</h3>
                    <p className="text-sm opacity-90">
                      View sales & profit insights
                    </p>
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

export default VendorDashboard;
