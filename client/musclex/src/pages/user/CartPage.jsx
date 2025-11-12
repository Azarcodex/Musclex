import React from "react";
import Cart from "../../components/user/Cart";
import { Navbar } from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import { useGetCart } from "../../hooks/users/useAddCart";

const CartPage = () => {
  const { data: cartitems } = useGetCart();

  return (
    <div>
      <Navbar />
      <Cart cartData={cartitems} />

      <Footer />
    </div>
  );
};

export default CartPage;
