import React, { useState } from "react";
import {
  MailIcon,
  PhoneIcon,
  HeartIcon,
  ShoppingCartIcon,
  ChevronDownIcon,
  User2,
  LucideLogOut,
  LucideBriefcaseBusiness,
  User2Icon,
} from "lucide-react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { clearUserToken } from "../../store/features/userSlice";
import { useGetCart } from "../../hooks/users/useAddCart";
import { usegetWishList } from "../../hooks/users/usegetWishList";
export function NavbarListingProduct() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [active, setActive] = useState(() => {
    if (location.pathname === "/") return "home";
    if (location.pathname === "/user/products") return "product";
    return "home";
  });

  const { data: cartitems } = useGetCart();
  const { data: wishList } = usegetWishList();
  const isAuth = useSelector((state) => state.userAuth.isAuth);

  // Set active based on current location
  React.useEffect(() => {
    if (location.pathname === "/") {
      setActive("home");
    } else if (location.pathname === "/user/products") {
      setActive("product");
    } else {
      setActive("");
    }
  }, [location.pathname]);

  //HANDLING LOGOUT

  const handleLogOut = () => {
    dispatch(clearUserToken());
    navigate("/user/login", { replace: true });
    toast.success("logged out successfully");
  };
  //  ;

  return (
    <nav className="w-full relative">
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
            <button
              className="flex items-center gap-1 hover:opacity-80"
              onClick={() => navigate("/user/wishlist")}
            >
              <div className="relative">
                <HeartIcon className="w-4 h-4" />

                {wishList?.wishList?.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-pink-600 text-white rounded-full px-1.5 py-[1px] text-[8px] leading-none">
                    {wishList?.wishList?.length}
                  </span>
                )}
              </div>
            </button>

            <button
              className="hover:opacity-80 p-2 cursor-pointer"
              onClick={() => navigate("/user/cart")}
            >
              <div className="relative">
                <ShoppingCartIcon className="w-4 h-4" />

                {cartitems?.items?.length > 0 && (
                  <span
                    className="absolute -top-1 -right-1 bg-pink-600 text-white 
                       rounded-full px-1.5 py-[1px] text-[7px] leading-none"
                  >
                    {cartitems?.items?.length}
                  </span>
                )}
              </div>
            </button>

            {!isAuth ? (
              <Link to={"/user/login"}>
                <button className="flex items-center gap-1 hover:opacity-80">
                  <User2 className="w-4 h-4" />
                  Login
                </button>
              </Link>
            ) : (
              <div className="flex items-center gap-6">
                <button onClick={() => navigate("/user/userdetails/profile")}>
                  <User2Icon className="w-5 h-5 cursor-pointer" />
                </button>
                <button
                  className="flex items-center gap-1 hover:opacity-80  border-b-2 border-white"
                  onClick={handleLogOut}
                >
                  <LucideLogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            )}
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
            <Link
              to={"/"}
              className={`flex items-center gap-1  font-medium hover:text-purple-700 ${
                active === "home" ? "text-purple-900" : ""
              }`}
            >
              {" "}
              Home
              {active === "home" && <ChevronDownIcon className="w-4 h-4" />}
            </Link>
            <Link
              to={"/user/products"}
              className={`flex items-center gap-1  font-medium hover:text-purple-700 ${
                active === "product" ? "text-purple-900" : ""
              }`}
            >
              products
              {active === "product" && <ChevronDownIcon className="w-4 h-4" />}
            </Link>
            <a
              href="#"
              onClick={() => toast.message("coming Soon")}
              className="text-gray-700 hover:text-purple-600"
            >
              Help
            </a>
            <a
              href="#"
              onClick={() => toast.message("coming Soon")}
              className="text-gray-700 hover:text-purple-600"
            >
              About
            </a>
            <a
              href="#"
              onClick={() => toast.message("coming Soon")}
              className="text-gray-700 hover:text-purple-600"
            >
              Contact
            </a>
            <Link
              to={"/vendor/login"}
              className="bg-gradient-to-r from-purple-700 via-purple-500 to-pink-500 px-2 py-1 rounded-ee-full rounded-l-4xl rounded-t-full rounded-br-xl flex items-center gap-2.5 text-white text-sm font-semibold shadow-lg hover:from-pink-500 hover:to-purple-600 hover:shadow-purple-400/50 transition-all duration-300"
            >
              <LucideBriefcaseBusiness className="w-4 h-4" />
              become a seller
            </Link>
          </div>

          {/* Search Bar */}
          <div className="flex items-center ">
            {/* <div className="flex items-center border border-gray-300 rounded-md overflow-hidden">
              <input
                type="text"
                placeholder="Search..."
                className="px-4 py-2 outline-none w-64"
                onChange={HandleChange}
              />
              <button className="bg-purple-600 text-white px-4 py-2 rounded-2xl hover:bg-purple-700">
                <SearchIcon className="w-5 h-5" />
              </button>
            </div> */}
          </div>
        </div>
      </div>
    </nav>
  );
}
