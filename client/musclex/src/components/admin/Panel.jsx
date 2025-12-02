import React, { useState } from "react";
import {
  LayoutDashboard,
  Image,
  Store,
  Users,
  LayoutTemplate,
  Tag,
  LogOut,
  ChevronDown,
  FileText,
  Package,
  UserCircle,
  UserPlus,
  Boxes,
  Layers,
  TicketPercent,
  LogIn,
  Home,
  Wallet,
} from "lucide-react";
import { NavLink } from "react-router-dom";

function Panel() {
  const [expandedItems, setExpandedItems] = useState([]);

  const toggleExpand = (label) => {
    setExpandedItems((prev) =>
      prev.includes(label)
        ? prev.filter((item) => item !== label)
        : [...prev, label]
    );
  };

  const navItems = [
    {
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      path: "/dashboard",
    },
    {
      label: "Home Slides",
      icon: <Image size={20} />,
      path: "/dashboard/home-slides",
    },
    {
      label: "Vendors",
      icon: <Store size={20} />,
      children: [
        {
          label: "Vendor Details",
          icon: <FileText size={18} />,
          path: "/admin/dashboard/vendors/list",
        },
        {
          label: "Vendor Products",
          icon: <Boxes size={18} />,
          path: "/admin/dashboard/vendors/list/products",
        },
      ],
    },
    {
      label: "Users",
      icon: <Users size={20} />,
      children: [
        {
          label: "Users List",
          icon: <UserCircle size={18} />,
          path: "/admin/dashboard/users/list",
        },
        {
          label: "Coupon",
          icon: <TicketPercent size={18} />,
          path: "/dashboard/users/coupon",
        },
        {
          label: "Referral",
          icon: <UserPlus size={18} />,
          path: "/dashboard/users/referral",
        },
      ],
    },
    {
      label: "Category",
      icon: <Layers size={20} />,
      children: [
        {
          label: "Category List",
          icon: <FileText size={18} />,
          path: "/admin/dashboard/category",
        },
      ],
    },
    {
      label: "Offers",
      icon: <LayoutTemplate size={20} />,
      path: "/admin/dashboard/addOffer",
    },
    {
      label: "Coupon",
      icon: <TicketPercent size={20} />,
      path: "/admin/dashboard/coupon",
    },
    {
      label: "Logout",
      icon: <LogOut size={20} />,
      path: "/logout",
    },
  ];

  return (
    <div className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col">
      {/* Sidebar Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        {navItems.map((item) => (
          <div key={item.label}>
            {item.children ? (
              <>
                {/* Parent with children */}
                <button
                  onClick={() => toggleExpand(item.label)}
                  className="w-full flex items-center justify-between px-6 py-3 text-gray-700 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-gray-600">{item.icon}</span>
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 ${
                      expandedItems.includes(item.label) ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Child links */}
                {expandedItems.includes(item.label) && (
                  <div className="bg-gray-50">
                    {item.children.map((child) => (
                      <NavLink
                        key={child.label}
                        to={child.path}
                        className={({ isActive }) =>
                          `flex items-center gap-3 px-6 pl-14 py-2.5 transition-colors duration-200 ${
                            isActive
                              ? "bg-gray-200 text-gray-800 font-medium"
                              : "text-gray-600 hover:bg-gray-100"
                          }`
                        }
                      >
                        <span className="text-gray-500">{child.icon}</span>
                        <span className="text-sm">{child.label}</span>
                      </NavLink>
                    ))}
                  </div>
                )}
              </>
            ) : (
              // Direct single NavLink (no children)
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-6 py-3 transition-colors duration-200 ${
                    isActive
                      ? "bg-gray-200 text-gray-800 font-semibold"
                      : "text-gray-700 hover:bg-gray-50"
                  }`
                }
              >
                <span className="text-gray-600">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            )}
          </div>
        ))}
      </nav>
    </div>
  );
}

export default Panel;
