import React from "react";
import {
  User,
  MapPin,
  Heart,
  ShoppingBag,
  Wallet,
  Gift,
  LogOut,
  Home,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useGetUserdata } from "../../hooks/users/useGetUserdata";
import { useDispatch } from "react-redux";
import { clearUserToken } from "../../store/features/userSlice";
import { toast } from "sonner";

export default function UserPanel() {
  const { data } = useGetUserdata();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const userInitial = data?.user?.name
    ? data.user.name.charAt(0).toUpperCase()
    : "U";

  const isItemActive = (link) => {
    if (!link) return false;
    const currentPath = location.pathname.toLowerCase();

    if (link === "/user/orders") {
      return currentPath.startsWith(link.toLowerCase());
    }

    return currentPath.endsWith(link.toLowerCase());
  };

  const menuItems = [
    { icon: User, label: "My Profile", link: "profile" },
    { icon: MapPin, label: "Address", link: "address" },
    { icon: ShoppingBag, label: "My Orders", link: "/user/orders" },
    { icon: Heart, label: "My Wishlist", link: "wishlist" },
    { icon: Wallet, label: "My Wallet", link: "wallet" },
    { icon: Gift, label: "Referrals", link: "referral" },
    { icon: LogOut, label: "Logout" },
  ];

  const handleLogOut = () => {
    dispatch(clearUserToken());
    navigate("/user/login", { replace: true });
    toast.success("Logged out successfully.");
  };

  return (
    <div className="w-80 h-full min-h-screen bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100 transition-all duration-300">
      <Link
        to="/"
        className="flex items-center gap-2 px-6 py-3 text-sm font-medium text-indigo-700 border-b border-gray-100 hover:bg-indigo-50 transition-colors"
      >
        <Home className="w-4 h-4" />
        Back to Home
      </Link>

      <div className="p-6 text-center border-b border-gray-100 bg-white">
        <div className="w-20 h-20 bg-gradient-to-br from-purple-500 to-orange-400 text-white text-3xl font-bold rounded-full mx-auto mb-3 flex items-center justify-center shadow-lg transform transition-transform duration-200 hover:scale-105">
          {userInitial}
        </div>
        <h2 className="text-xl font-bold text-gray-900 truncate">
          {data?.user?.name || "User Name"}
        </h2>
        <p className="text-sm text-gray-500 mt-1 truncate">
          {data?.user?.email || "user@example.com"}
        </p>
      </div>

      <nav className="py-4 space-y-1">
        {menuItems.map((item, index) => {
          const isLogout = item.label === "Logout";
          const isActive = !isLogout && isItemActive(item.link);

          const finalLink = item.link
            ? item.link.startsWith("/")
              ? item.link
              : item.link
            : "#";

          const classNames = `
            w-full flex items-center px-6 py-3 text-left transition-colors duration-200 
            ${
              isActive
                ? "bg-purple-50 text-purple-600 font-semibold border-l-4 border-purple-500"
                : "text-gray-700 hover:bg-orange-50 hover:text-gray-900"
            }
          `;

          const IconComponent = item.icon;

          return (
            <div key={index} className="relative">
              {isLogout ? (
                <button
                  onClick={handleLogOut}
                  className="w-full flex items-center px-6 py-3 text-left text-gray-700 hover:bg-orange-50 hover:text-purple-600 transition-colors"
                >
                  <IconComponent className="w-5 h-5 mr-3 text-gray-500 hover:text-purple-600 transition-colors" />
                  <span className="font-medium">Logout</span>
                </button>
              ) : (
                <Link to={finalLink} className={classNames}>
                  <IconComponent
                    className={`w-5 h-5 mr-3 ${
                      isActive ? "text-purple-600" : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      <div className="p-4 text-center border-t border-gray-100 mt-4">
        <p className="text-xs text-gray-400">© 2025 musclex</p>
      </div>
    </div>
  );
}
