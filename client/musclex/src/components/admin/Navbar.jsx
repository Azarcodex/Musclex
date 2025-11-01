import React from "react";
import { Bell, CircleUser, LogOutIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
  const navigate = useNavigate();
  const HandleLogout = () => {
    localStorage.removeItem("admin");
    navigate("/admin/login");
  };
  return (
    <div className="w-full bg-violet-500 flex items-center justify-between p-5">
      <h1 className="text-white font-extrabold text-4xl">MuscleX</h1>
      <div className="flex items-center justify-between gap-4">
        <Bell className="text-white" />
        <LogOutIcon size={"30"} onClick={HandleLogout} />
      </div>
    </div>
  );
};

export default Navbar;
