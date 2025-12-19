import React, { useEffect, useState } from "react";
import { Navbar } from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import FilterSidebar from "../../components/user/FilterSide";
import { useProductFetch } from "../../hooks/users/useProductFetch";
import { useSelector } from "react-redux";
import { useSearch } from "../../hooks/users/useSearch";
import SearchData from "../../components/user/SearchData";
import { ChevronLeft, ChevronRight } from "lucide-react";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 60000]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortValue, setSortValue] = useState("");

  //pagination
  const [page, setPage] = useState(1);

  const { data } = useProductFetch(
    page,
    selectedCategory,
    selectedBrands,
    priceRange,
    selectedRatings,
    sortValue
  );
  const totalPages = data?.pagination?.totalPages;
  const totalProducts = data?.pagination?.totalProducts;
  const current = data?.pagination?.current;

  //handleNext
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  //handlePrev
  const handlePrev = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  console.log(data);
  const { query } = useSelector((state) => state.search);
  const [debounce, setDebounce] = useState(query);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDebounce(query);
    }, 500);
    return () => clearTimeout(timeOut);
  }, [query]);

  const { data: searching, isPending: isLoading } = useSearch(debounce);

  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div>
        <div className="relative mt-10 bg-white flex items-center justify-end-safe mr-40">
          {/* Extra filter options */}
          <div className="absolute right-0 z-50 top-[-40px]">
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
          <select
            value={sortValue}
            onChange={(e) => setSortValue(e.target.value)}
            className="appearance-none bg-white border-2 border-gray-300 rounded-lg px-5 py-3 pr-12 text-gray-700 font-medium hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md min-w-[200px]"
          >
            <option value="default">View: Default</option>
            <option value="sortAZ">Sort: A-Z</option>
            <option value="sortZA">Sort: Z-A</option>
            <option value="sort01">Sort: Oldest First</option>
            <option value="sort10">Sort: Newest First</option>
          </select>
        </div>

        <div className="flex items-start mt-20 justify-center flex-row min-h-screen px-20 py-10">
          <div>
            <FilterSidebar
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              selectedBrands={selectedBrands}
              setSelectedBrands={setSelectedBrands}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              selectedRatings={selectedRatings}
              setSelectedRatings={setSelectedRatings}
            />
          </div>

          <div className="w-full">
            <div className="grid grid-cols-4 px-4 py-2 gap-6 w-full">
              {data?.result?.map((prop) => (
                <ProductCard key={prop._id} product={prop} />
              ))}
            </div>

            {/* Pagination UI */}
            <div className="flex items-center justify-center mt-12 mb-8 gap-3">
              {/* Previous Button */}
              <button
                onClick={handlePrev}
                disabled={page === 1}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium ${
                  page === 1
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                <ChevronLeft size={18} />
                Previous
              </button>

              {/* Page Info */}
              <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700">
                <span>Page</span>
                <span className="text-blue-600 font-semibold">
                  {current || page}
                </span>
                <span className="text-gray-400">of</span>
                <span className="font-semibold">{totalPages || 1}</span>
              </div>

              {/* Next Button */}
              <button
                onClick={handleNext}
                disabled={page === totalPages}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-all font-medium ${
                  page === totalPages
                    ? "border-gray-200 text-gray-400 cursor-not-allowed"
                    : "border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400"
                }`}
              >
                Next
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
