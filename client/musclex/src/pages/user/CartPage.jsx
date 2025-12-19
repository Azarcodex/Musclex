import React from "react";
import Cart from "../../components/user/Cart";
import Footer from "../../components/user/Footer";
import { useGetCart } from "../../hooks/users/useAddCart";
import { Link } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import { NavbarListingProduct } from "../../components/user/NavbarListingProduct";
const CartPage = () => {
  const { data: cartitems } = useGetCart();

  const isEmpty =
    !cartitems || !cartitems.items || cartitems.items.length === 0;

  return (
    <div className="min-h-screen flex flex-col">
      <NavbarListingProduct />
      <div className="flex-1">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center">
            <div className="bg-purple-50 p-6 rounded-full mb-4">
              <ShoppingCart size={48} className="text-purple-600" />
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 mb-2">
              Your cart is empty
            </h2>

            <p className="text-gray-500 mb-6 max-w-sm">
              Looks like you haven’t added anything yet. Start shopping to see
              items here.
            </p>

            <Link
              to="/user/products"
              className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
            >
              Browse Products
            </Link>
          </div>
        ) : (
          <Cart cartData={cartitems} />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default CartPage;
