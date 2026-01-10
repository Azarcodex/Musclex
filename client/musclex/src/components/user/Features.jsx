import React, { useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usegetFeaturedProducts } from "../../hooks/users/useProductListings";

const ProductCard = ({ product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();

  // const handleNavigate = () => {
  //   navigate(`/products/${product._id}`);
  // };

  return (
    <div
      onClick={() => navigate(`/user/products/${product._id}`)}
      className="relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 w-72 flex-shrink-0 group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image Container */}
      <div className="relative bg-gradient-to-br from-gray-50 to-purple-50 p-8 flex items-center justify-center h-72 overflow-hidden">
        <img
          src={`${import.meta.env.VITE_API_URL}${product.variant?.images?.[0]}`}
          alt={product.name}
          className="w-48 h-48 object-contain transition-transform duration-500 ease-out"
          style={{
            transform: isHovered ? "scale(1.15) rotate(2deg)" : "scale(1)",
          }}
        />

        {/* Overlay Gradient on Hover */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-purple-900/20 to-transparent transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
          }}
        />
      </div>

      {/* Product Details */}
      <div className="p-5 bg-white">
        {/* Brand Name */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-purple-600 uppercase tracking-wide">
            {product?.brandID?.brand_name}
          </span>
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium text-gray-700">4.5</span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="text-lg font-bold text-gray-900 line-clamp-2 min-h-[3.5rem]">
          {product.name}
        </h3>
      </div>
    </div>
  );
};

const FeaturedProducts = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const cardsPerView = 3;
  const { data: getProducts } = usegetFeaturedProducts();

  const maxIndex = Math.max(
    0,
    (getProducts?.product?.length || 0) - cardsPerView
  );

  const nextSlide = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const prevSlide = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToSlide = (index) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  return (
    <div className="bg-gradient-to-b from-white to-gray-50 py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="text-purple-600 font-semibold text-sm uppercase tracking-wider">
            Handpicked Selection
          </span>
          <h2 className="text-5xl font-bold text-gray-900 mt-2 mb-4">
            Featured Products
          </h2>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Discover our carefully curated collection of premium products
          </p>
        </div>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 z-20 bg-white text-purple-600 rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-all duration-300 border-2 border-purple-200 ${
              currentIndex === 0
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-purple-600 hover:text-white hover:scale-110 hover:shadow-2xl"
            }`}
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <button
            onClick={nextSlide}
            disabled={currentIndex === maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 z-20 bg-white text-purple-600 rounded-full w-14 h-14 flex items-center justify-center shadow-xl transition-all duration-300 border-2 border-purple-200 ${
              currentIndex === maxIndex
                ? "opacity-30 cursor-not-allowed"
                : "hover:bg-purple-600 hover:text-white hover:scale-110 hover:shadow-2xl"
            }`}
          >
            <ChevronRight className="w-7 h-7" />
          </button>

          {/* Products Container */}
          <div className="overflow-hidden px-8">
            <div
              className="flex gap-8 transition-transform duration-700 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (288 + 32)}px)`,
              }}
            >
              {getProducts?.product?.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2.5 mt-10">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2.5 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-10 bg-gradient-to-r from-purple-600 to-purple-700 shadow-md"
                    : "w-2.5 bg-gray-300 hover:bg-gray-400 hover:scale-125"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedProducts;
