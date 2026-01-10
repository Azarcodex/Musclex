import React from "react";
import UserPanel from "../../../components/user/UserPanel";
import { Outlet } from "react-router-dom";

const UserProfile = () => {
  return (
    <div className="h-screen flex">
      <div className="flex flex-1 overflow-hidden">
        <div className="w-72">
          <UserPanel />
        </div>
        <main className="flex-1 overflow-y-auto p-15">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default UserProfile;
