import React, { useEffect, useState } from "react";
import { Navbar } from "../../components/user/Navbar";
import { HeroSlider } from "../../components/user/HeroSlider";
import FeaturedProducts from "../../components/user/Features";
import LatestProducts from "../../components/user/LatestProducts";
import MuscleXFeatures from "../../components/user/FeatureCard";
import BecomeVendor from "../../components/user/BecomeVendor";
import Footer from "../../components/user/Footer";
import { useSelector } from "react-redux";

const Home = () => {
  return (
    <div>
      <Navbar />
      <HeroSlider />
      <FeaturedProducts />
      <LatestProducts />
      <MuscleXFeatures />
      <BecomeVendor />
      <Footer />
    </div>
  );
};

export default Home;
