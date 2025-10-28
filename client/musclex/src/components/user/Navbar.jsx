import React from "react";
import {
  MailIcon,
  PhoneIcon,
  HeartIcon,
  ShoppingCartIcon,
  SearchIcon,
  ChevronDownIcon,
  User2,
  LogOutIcon,
  LucideLogOut,
  LucideBriefcaseBusiness,
} from "lucide-react";
import { Link } from "react-router-dom";
import { userAuthStore } from "../../hooks/users/zustand/useAuth";
import { toast } from "sonner";

export function Navbar() {
  const token = userAuthStore((state) => state.token);
  const { clearToken } = userAuthStore();
  const handleLogOut = () => {
    clearToken();
    toast.success("logged out successfully");
  };
  return (
    <nav className="w-full">
      {/* Top Header Bar */}
      <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center text-sm">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <MailIcon className="w-4 h-4" />
              <span>musclex@gmail.com</span>
            </div>
            <div className="flex items-center gap-2">
              <PhoneIcon className="w-4 h-4" />
              <span>(12345)67809</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {!token ? (
              <Link to={"/user/login"}>
                <button className="flex items-center gap-1 hover:opacity-80">
                  <User2 className="w-4 h-4" />
                  Login
                </button>
              </Link>
            ) : (
              <button
                className="flex items-center gap-1 hover:opacity-80  border-b-2 border-white"
                onClick={handleLogOut}
              >
                <LucideLogOut className="w-4 h-4" />
                Logout
              </button>
            )}
            <button className="flex items-center gap-1 hover:opacity-80">
              <HeartIcon className="w-4 h-4" />
              <span>Wishlist</span>
            </button>
            <button className="hover:opacity-80">
              <ShoppingCartIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="bg-white shadow-sm py-4 px-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Logo */}
          <div className="text-2xl font-bold text-gray-900">MuscleX</div>

          {/* Navigation */}
          <div className="flex items-center gap-8">
            <button className="flex items-center gap-1 text-purple-600 font-medium hover:text-purple-700">
              Home
              <ChevronDownIcon className="w-4 h-4" />
            </button>
            <a href="#" className="text-gray-700 hover:text-purple-600">
              Products
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600">
              Help
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600">
              About
            </a>
            <a href="#" className="text-gray-700 hover:text-purple-600">
              Contact
            </a>
            <a
              href="#"
              className="bg-gradient-to-r from-purple-700 via-purple-500 to-pink-500 px-2 py-1 rounded-ee-full rounded-l-4xl rounded-t-full rounded-br-xl flex items-center gap-2.5 text-white text-sm font-semibold shadow-lg hover:from-pink-500 hover:to-purple-600 hover:shadow-purple-400/50 transition-all duration-300"
            >
              <LucideBriefcaseBusiness className="w-4 h-4" />
              become a seller
            </a>
          </div>

          {/* Search Bar */}
          <div className="flex items-center">
            <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search..."
                className="px-4 py-2 outline-none w-64"
              />
              <button className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700">
                <SearchIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
