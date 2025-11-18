import React, { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import spot from "../../assets/spot.png";
import { useSearch } from "../../hooks/users/useSearch";
import { useSelector } from "react-redux";
import SearchData from "./SearchData";
const slides = [
  {
    id: 1,
    tagline: "Train Hard, Stay Strong.",
    title: "Build Your Ultimate Home Gym",
    description:
      "From adjustable dumbbells to durable mats, get everything you need to train like a pro right at home. Designed for endurance, precision, and peak performance.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    discount: "35% off",
  },
  {
    id: 2,
    tagline: "Fuel Every Rep, Every Set.",
    title: "Top-Quality Gym Accessories",
    description:
      "Discover gloves, straps, and gear that keep up with your toughest workouts. Built for comfort, grip, and long-lasting support — made for serious lifters.",
    image:
      "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80",
    discount: "25% off",
  },
  {
    id: 3,
    tagline: "Stronger Every Day.",
    title: "Level Up Your Fitness Routine",
    description:
      "Upgrade your daily grind with elite equipment that inspires progress. Whether you're bulking, cutting, or maintaining, find tools that match your goals.",
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
  //search
  const { query } = useSelector((state) => state.search);
  const [debounce, setDebounce] = useState(query);
  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDebounce(query);
    }, 500);
    return () => clearTimeout(timeOut);
  }, [query]);
  const { data: searching, isPending: isLoading } = useSearch(debounce);
  // if (!query.trim()) return null;
  const isSearch = Boolean(debounce) && isLoading;
  // useEffect(() => {
  //   if (searching) {
  //     const { count} = searching;
  //   }
  // }, [searching]);

  if (isSearch) {
    return <p>Loading data</p>;
  }

  return (
    <div className="relative w-full bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 overflow-hidden px-28 py-10">
      <div className="absolute right-40 z-50 top-1">
        {searching?.results?.length > 0 && (
          <p className="text-right font-semibold text-xs text-pink-600">
            {searching.count} data found
          </p>
        )}
        {searching?.results &&
          searching?.results.map((seach, idx) => (
            <SearchData item={seach} key={seach._id} />
          ))}
      </div>
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
