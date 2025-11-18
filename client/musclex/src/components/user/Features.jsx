import React, { useState } from "react";
import { ShoppingCart, Heart, ChevronLeft, ChevronRight } from "lucide-react";
import { useGetProducts } from "../../hooks/vendor/useGetProducts";
import { useGetFeatured } from "../../hooks/users/useProductFetch";

const ProductCard = ({ product, isActive }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div
      className="relative bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 w-64 flex-shrink-0"
      style={{
        border: isHovered ? "3px solid #7c3aed" : "3px solid transparent",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Sale Badge */}
      {/* {product.badge && (
        <div className={`absolute top-4 left-4 ${product.badge === 'Sale Ends' ? 'bg-green-500' : 'bg-red-500'} text-white text-xs font-semibold px-3 py-1 rounded-full z-10`}>
          {product.badge}
        </div>
      )} */}

      {/* Product Image Container */}
      <div className="relative bg-gray-50 p-8 flex items-center justify-center h-64">
        <img
          src={`${import.meta.env.VITE_API_URL}${product.variant?.images?.[0]}`}
          alt={product.name}
          className="w-40 h-40 rounded-lg object-contain transition-transform duration-300"
          style={{
            transform: isHovered ? "scale(1.1)" : "scale(1)",
          }}
        />

        {/* Action Icons - Show on Hover */}
        <div
          className="absolute top-4 right-4 flex flex-col gap-2 transition-opacity duration-300"
          style={{
            opacity: isHovered ? 1 : 0,
          }}
        >
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-purple-50 transition-colors">
            <ShoppingCart className="w-4 h-4 text-purple-600" />
          </button>
          <button className="bg-white rounded-full p-2 shadow-md hover:bg-purple-50 transition-colors">
            <Heart className="w-4 h-4 text-purple-600" />
          </button>
        </div>
      </div>
      <div className="bg-purple-100 flex items-center flex-col">
        <span>{product.name}</span>
        <span className="underline">{product?.brandID?.brand_name}</span>
        <p className="flex items-center justify-center gap-2">
          <span className="text-pink-600 line-through font-semibold">
            ${product?.variant?.size?.[0].oldPrice}
          </span>
          <span className="text-purple-700 font-bold">
            ${product?.variant?.size?.[0].salePrice}
          </span>
        </p>
      </div>
    </div>
  );
};

const FeaturedProducts = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsPerView, setCardsPerView] = useState(3);

  // const products = [
  //   {
  //     id: 1,
  //     name: "Wrist Band",
  //     price: 42.0,
  //     image:
  //       "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&h=400&fit=crop",
  //   },
  //   {
  //     id: 2,
  //     name: "Wrist Band",
  //     price: 42.0,
  //     image:
  //       "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=400&h=400&fit=crop",
  //   },
  //   {
  //     id: 3,
  //     name: "Wrist Band",
  //     price: 42.0,
  //     image:
  //       "https://images.unsplash.com/photo-1576243345690-4e4b79b63288?w=400&h=400&fit=crop",
  //   },
  //   {
  //     id: 4,
  //     name: "Wrist Band",
  //     price: 42.0,
  //     image:
  //       "https://images.unsplash.com/photo-1611312449408-fcece27cdbb7?w=400&h=400&fit=crop",
  //   },
  // ];
  const { data: getProducts } = useGetFeatured();
  console.log(getProducts);
  const maxIndex = Math.max(0, getProducts?.data?.length - cardsPerView);

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
    <div className=" bg-gray-50 py-12 px-4">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
          Featured Products
        </h2>

        <div className="relative">
          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-20 bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors ${
              currentIndex === 0
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-700"
            }`}
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            disabled={currentIndex === maxIndex}
            className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-20 bg-purple-600 text-white rounded-full w-12 h-12 flex items-center justify-center shadow-lg transition-colors ${
              currentIndex === maxIndex
                ? "opacity-50 cursor-not-allowed"
                : "hover:bg-purple-700"
            }`}
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Products Container */}
          <div className="overflow-hidden px-8">
            <div
              className="flex gap-6 transition-transform duration-500 ease-in-out"
              style={{
                transform: `translateX(-${currentIndex * (256 + 24)}px)`,
              }}
            >
              {getProducts?.product?.map((product, index) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  isActive={index === currentIndex}
                />
              ))}
            </div>
          </div>

          {/* Dots Indicator */}
          <div className="flex justify-center gap-2 mt-8">
            {Array.from({ length: maxIndex + 1 }).map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "w-8 bg-purple-600"
                    : "w-2 bg-gray-300 hover:bg-gray-400"
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
