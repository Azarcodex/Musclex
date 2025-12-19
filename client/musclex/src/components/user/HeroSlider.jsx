import React, { useEffect, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon, Loader2 } from "lucide-react";
import spot from "../../assets/spot.png";
import { useSearch } from "../../hooks/users/useSearch";
import { useSelector } from "react-redux";
import SearchData from "./SearchData";
import { useGetBanners } from "../../hooks/users/useBanner";
import { useNavigate } from "react-router-dom";

export function HeroSlider() {
  const navigate=useNavigate()
  const [currentSlide, setCurrentSlide] = useState(0);
  const URL = import.meta.env.VITE_API_URL;
  const { data: slides } = useGetBanners();

  useEffect(() => {
    if (!slides?.slides?.length) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.slides.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [slides?.slides?.length]);

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };
  const nextSlide = () => {
    if (!slides?.slides?.length) return;
    setCurrentSlide((prev) => (prev + 1) % slides.slides.length);
  };

  const prevSlide = () => {
    if (!slides?.slides?.length) return;
    setCurrentSlide(
      (prev) => (prev - 1 + slides.slides.length) % slides.slides.length
    );
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

  const isSearch = Boolean(debounce) && isLoading;

  if (isSearch) {
    return (
      <div className="flex h-96 items-center justify-center bg-pink-50">
        <Loader2 className="h-8 w-8 animate-spin text-pink-600" />
      </div>
    );
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 py-12 lg:py-16">
      {/* Search Results */}
      <div className="absolute right-4 top-4 z-50 md:right-10">
        {searching?.results?.length > 0 && (
          <div className="w-72 rounded-lg border border-pink-100 bg-white/90 p-4 shadow-xl backdrop-blur-sm">
            <p className="mb-2 text-right text-xs font-semibold text-pink-600">
              {searching.count} data found
            </p>
            <div className="max-h-60 overflow-y-auto">
              {searching?.results &&
                searching?.results.map((seach, idx) => (
                  <SearchData item={seach} key={seach._id} />
                ))}
            </div>
          </div>
        )}
      </div>

      <div className="pointer-events-none absolute left-0 top-0 opacity-50">
        <img src={spot} alt="" className="w-40" />
      </div>

      {/* Main Container */}
      <div className="relative mx-auto flex min-h-[400px] max-w-7xl items-center px-8">
        {slides?.slides?.map((slide, index) => (
          <div
            key={slide._id}
            className={`w-full transition-all duration-700 ease-in-out ${
              index === currentSlide
                ? "relative z-10 opacity-100"
                : "absolute inset-0 z-0 opacity-0"
            }`}
          >
            <div className="flex flex-col-reverse items-center gap-8 md:flex-row md:justify-between md:gap-12">
              {/* Left Content */}
              <div className="flex-1 space-y-5 text-center md:text-left">
                <span className="inline-block rounded-full bg-pink-100 px-4 py-2 text-xs font-bold uppercase tracking-wider text-pink-600">
                  {slide.smallHeading}
                </span>
                <h1 className="text-3xl font-extrabold leading-tight text-gray-900 lg:text-5xl">
                  {slide.heading}
                </h1>
                <p className="mx-auto max-w-lg text-base leading-relaxed text-gray-600 md:mx-0 lg:text-lg">
                  {slide.description}
                </p>
                <button onClick={()=>navigate("/user/products")} className="rounded-full bg-pink-500 px-8 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-pink-600 hover:shadow-pink-500/30">
                  Shop Now
                </button>
              </div>

              {/* Right Content - Product Image */}
              <div className="relative flex flex-1 justify-center md:justify-end">
                {/* Background Blob */}
                <div className="absolute inset-0 translate-x-4 translate-y-4 scale-75 transform rounded-full bg-gradient-to-br from-purple-200 to-pink-200 opacity-40 blur-2xl"></div>

                {/* IMAGE SIZE CHANGED HERE: max-w-[350px] makes it much smaller */}
                <img
                  src={`${URL}/uploads/${slide.image}`}
                  alt="Fitness Equipment"
                  className="relative z-10 w-full max-w-[280px] rounded-2xl object-cover shadow-xl transition-transform duration-500 ease-in-out hover:scale-105 md:max-w-[350px]"
                />
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-2 top-1/2 z-20 -translate-y-1/2 transform rounded-full bg-white/70 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 md:-left-2"
        >
          <ChevronLeftIcon className="h-6 w-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-2 top-1/2 z-20 -translate-y-1/2 transform rounded-full bg-white/70 p-2 text-gray-800 shadow-md backdrop-blur-sm transition-all hover:bg-white hover:scale-110 md:-right-2"
        >
          <ChevronRightIcon className="h-6 w-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute -bottom-10 left-1/2 flex -translate-x-1/2 transform justify-center gap-3 md:bottom-0">
          {slides?.slides?.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-500 ${
                index === currentSlide
                  ? "w-8 bg-pink-500"
                  : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
