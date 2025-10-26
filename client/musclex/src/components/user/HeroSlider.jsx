import React, { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import spot from "../../assets/spot.png";
const slides = [
  {
    id: 1,
    tagline: "Premium Gym Essentials For Every Athlete...",
    title: "Upgrade Your Fitness Gear",
    description:
      "Discover the latest dumbbells, shoes, and supplements to elevate your workout. High-quality gym essentials for every fitness enthusiast. Gear up for strength, endurance, and style.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    discount: "50% off",
  },
  {
    id: 2,
    tagline: "Premium Gym Essentials For Every Athlete...",
    title: "Upgrade Your Fitness Gear",
    description:
      "Discover the latest dumbbells, shoes, and supplements to elevate your workout. High-quality gym essentials for every fitness enthusiast. Gear up for strength, endurance, and style.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    discount: "50% off",
  },
  {
    id: 3,
    tagline: "Premium Gym Essentials For Every Athlete...",
    title: "Upgrade Your Fitness Gear",
    description:
      "Discover the latest dumbbells, shoes, and supplements to elevate your workout. High-quality gym essentials for every fitness enthusiast. Gear up for strength, endurance, and style.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    discount: "50% off",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div className="relative w-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden px-28 py-10">
      <div className="absolute left-0 top-0">
        <img src={spot} alt="" className="w-40" />
      </div>
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={` ${
            index === currentSlide
              ? "opacity-100"
              : "opacity-0 absolute inset-0"
          }`}
        >
          <div className="flex items-center gap-8">
            {/* Left Content */}
            <div className="space-y-4">
              <p className="text-pink-500 font-medium">{slide.tagline}</p>
              <h1 className="text-4xl font-bold text-gray-900 leading-tight">
                {slide.title}
              </h1>
              <p className="text-gray-600 text-lg leading-relaxed">
                {slide.description}
              </p>
              <button className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-md font-medium transition-colors">
                Shop Now
              </button>
            </div>
            {/* Right Content - Product Image */}
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-200 to-pink-200 rounded-full opacity-30 blur-3xl"></div>
              <img
                src={slide.image}
                alt="Fitness Equipment"
                className="relative z-10 w-[48rem] shadow-lg rounded-ee-full rounded-t-full"
              />
              {/* <div className="absolute top-4 right-4 bg-cyan-400 text-white rounded-full w-20 h-20 flex flex-col items-center justify-center font-bold shadow-lg z-20">
                <span className="text-2xl">{slide.discount.split(" ")[0]}</span>
                <span className="text-sm">{slide.discount.split(" ")[1]}</span>
              </div> */}
            </div>
          </div>
        </div>
      ))}

      {/* Navigation Arrows */}
      <button
        onClick={prevSlide}
        className="absolute left-0 bottom-0 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
      >
        <ChevronLeftIcon className="w-6 h-6 text-gray-800" />
      </button>
      <button
        onClick={nextSlide}
        className="absolute right-0 bottom-0 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-colors"
      >
        <ChevronRightIcon className="w-6 h-6 text-gray-800" />
      </button>

      {/* Slide Indicators */}
      <div className="flex justify-center gap-2 mt-8">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentSlide
                ? "bg-pink-500 w-8"
                : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
