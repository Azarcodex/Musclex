import React from "react";
import VendorPanel from "../../components/vendor/VendorPanel";
import { Navbar } from "../../components/user/Navbar";
import { Outlet, useNavigate } from "react-router-dom";
import { Bell, LogOutIcon } from "lucide-react";
import { usevendorAuthStore } from "../../hooks/users/zustand/useAuth";

const VendorDasboard = () => {
  const navigate = useNavigate();
  const { clearToken } = usevendorAuthStore();
  const HandleLogout = () => {
    clearToken();
    navigate("/vendor/login");
  };
  return (
    <div className="h-screen flex flex-col">
      <div className="w-full bg-violet-500 flex items-center justify-between p-5">
        <h1 className="text-white font-extrabold text-4xl">MuscleX</h1>
        <div className="flex items-center justify-between gap-4">
          <Bell className="text-white" />
          <button onClick={HandleLogout}>
            <LogOutIcon size={"30"} />
          </button>
          {/* <span></span> */}
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64">
          <VendorPanel />
        </div>
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default VendorDasboard;
