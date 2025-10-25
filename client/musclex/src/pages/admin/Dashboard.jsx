import React from "react";
import Navbar from "../../components/admin/Navbar";
import Panel from "../../components/admin/Panel";
import { Outlet } from "react-router-dom";

const Dashboard = () => {
  return (
    <div className="h-screen flex flex-col" >
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64">
      <Panel />
      </div>
      <main className="flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
      </div>
    </div>
  );
};

export default Dashboard;
