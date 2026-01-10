import React from "react";
import { Navbar } from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import Checkout from "../../components/user/Checkout";

const CheckoutPage = () => {
  return (
    <div>
      <Navbar />
      <Checkout />
      <Footer />
    </div>
  );
};

export default CheckoutPage;
