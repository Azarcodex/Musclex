import React from "react";
import {
  User,
  MapPin,
  Heart,
  ShoppingBag,
  Wallet,
  Gift,
  LogOut,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useGetUserdata } from "../../hooks/users/useGetUserdata";

export default function UserPanel() {
  const { data } = useGetUserdata();
  const navigate = useNavigate();
  const menuItems = [
    { icon: User, label: "My Profile", active: false, link: "profile" },
    { icon: MapPin, label: "Address", active: false, link: "address" },
    { icon: Heart, label: "My List", active: false },
    {
      icon: ShoppingBag,
      label: "My Orders",
      active: false,
      link: "/user/orders",
    },
    { icon: Wallet, label: "My Wallet", active: false },
    { icon: Gift, label: "Referals", active: false },
    { icon: LogOut, label: "Logout", active: false },
  ];

  return (
    <div className="w-80 min-h-screen bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Profile Header */}
      <button
        onClick={() => navigate("/")}
        className="px-3 border-b border-black cursor-pointer hover:text-purple-800"
      >
        back to home
      </button>
      <div className="p-6 text-center bg-gray-50">
        <div className="w-24 h-24 bg-gradient-to-br from-gray-200 to-gray-300 rounded-full mx-auto mb-4"></div>
        <h2 className="text-lg font-semibold text-gray-800">
          {data?.user?.name}
        </h2>
        <p className="text-sm text-gray-500 mt-1">{data?.user?.email}</p>
      </div>

      {/* Menu Items */}
      <div className="py-2">
        {menuItems.map((item, index) => (
          <Link key={index} to={item.link}>
            <button
              key={index}
              className={`w-full flex items-center px-6 py-3 text-left transition-colors ${
                item.active
                  ? "bg-red-50 text-red-600 border-l-4 border-red-600"
                  : "text-gray-700 hover:bg-gray-50"
              }`}
            >
              <item.icon
                className={`w-5 h-5 mr-3 ${
                  item.active ? "text-red-600" : "text-gray-500"
                }`}
              />
              <span className="font-medium">{item.label}</span>
            </button>
          </Link>
        ))}
      </div>
    </div>
  );
}
