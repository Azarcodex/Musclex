import React, { useEffect } from "react";
import { Navbar } from "../../components/user/Navbar";
import { HeroSlider } from "../../components/user/HeroSlider";
import WristBandProductCard from "../../components/user/Features";
import FeaturedProducts from "../../components/user/Features";
import LatestProducts from "../../components/user/LatestProducts";
import MuscleXFeatures from "../../components/user/FeatureCard";
import BecomeVendor from "../../components/user/BecomeVendor";
import Footer from "../../components/user/Footer";

const Home = () => {
    useEffect(()=>
    {
        
    },[])
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
