import React, { useState } from "react";
import { Truck, Award, Shield, DollarSign } from "lucide-react";

const FeatureCard = ({ icon: Icon, title, description, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative h-[300px] rounded-lg p-8 text-center transition-all duration-300 cursor-pointer"
      style={{
        border: isHovered ? "3px solid #7c3aed" : "3px solid transparent",
        boxShadow: isHovered
          ? "0 10px 30px rgba(124, 58, 237, 0.2)"
          : "0 2px 10px rgba(0, 0, 0, 0.05)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Icon */}
      <div className="flex justify-center mb-4">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: isActive || isHovered ? "#7c3aed" : "#f3f4f6",
          }}
        >
          <Icon
            className="w-8 h-8 transition-colors duration-300"
            style={{
              color: isActive || isHovered ? "#ffffff" : "#7c3aed",
            }}
          />
        </div>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </div>
  );
};

const MuscleXFeatures = () => {
  const [activeIndex, setActiveIndex] = useState(1);

  const features = [
    {
      icon: Truck,
      title: "Fast & Free Shipping",
      description:
        "Get your supplements and gear quickly. Enjoy free shipping on all orders.",
    },
    {
      icon: Award,
      title: "100% Authentic Products",
      description:
        "We guarantee all products are genuine, direct from the brand. Verified ingredients and quality assurance on every item.",
    },
    {
      icon: Shield,
      title: "Secure Payments",
      description:
        "Shop confidently with our 100% safe and encrypted payment system. Your privacy and transaction safety are our top priorities.",
    },
    {
      icon: DollarSign,
      title: "Best Price Guarantee",
      description:
        "Top-quality fitness products at unbeatable prices. Train hard, save smart!",
    },
  ];

  return (
    <div className=" bg-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Title */}
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          what <span className="text-purple-600">MuscleX</span> provides
        </h2>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
          {features.map((feature, index) => (
            <div key={index} onClick={() => setActiveIndex(index)}>
              <FeatureCard
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isActive={activeIndex === index}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MuscleXFeatures;
