import React from "react";
import { Bell, CircleUser } from "lucide-react";
const Navbar = () => {
  return (
    <div className="w-full bg-violet-500 flex items-center justify-between p-5">
      <h1 className="text-white font-extrabold text-4xl">MuscleX</h1>
      <div className="flex items-center justify-between gap-4">
        <Bell className="text-white" />
        <CircleUser size={"30"} />
      </div>
    </div>
  );
};

export default Navbar;
