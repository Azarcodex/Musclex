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

  // pagination
  const [page, setPage] = useState(1);

  // redux search
  const { query } = useSelector((state) => state.search);
  const [debounce, setDebounce] = useState(query);

  /* -------------------------------
   DEBOUNCE SEARCH
-------------------------------- */
  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebounce(query);
    }, 500);

    return () => clearTimeout(timeout);
  }, [query]);

  /* -------------------------------
   FETCH PRODUCTS (NORMAL)
-------------------------------- */
  const { data: productData, isPending: isProductLoading } = useProductFetch(
    page,
    selectedCategory,
    selectedBrands,
    priceRange,
    selectedRatings,
    sortValue
  );

  /* -------------------------------
   FETCH SEARCH RESULTS
-------------------------------- */
  const { data: searchData, isPending: isSearchLoading } = useSearch(debounce, {
    enabled: !!debounce, //  IMPORTANT
  });

  /* -------------------------------
   DECIDE DATA SOURCE
-------------------------------- */
  const data = productData;
  const isLoading = isSearchLoading;
  console.log(data);

  /* -------------------------------
   PAGINATION DATA
-------------------------------- */
  const totalPages = data?.pagination?.totalPages || 1;
  const totalProducts = data?.pagination?.totalProducts || 0;
  const current = data?.pagination?.current || page;

  /* -------------------------------
   PAGINATION HANDLERS
-------------------------------- */
  const handleNext = () => {
    if (page < totalPages) setPage((prev) => prev + 1);
  };

  const handlePrev = () => {
    if (page > 1) setPage((prev) => prev - 1);
  };

  useEffect(() => {
    if (!data?.activeCategories) return;

    setSelectedCategory((prev) =>
      prev.filter((cat) =>
        data.activeCategories.some((c) => c.id === cat || c.name === cat)
      )
    );
  }, [data?.activeCategories]);

  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div>
        <div className="relative mt-10 bg-white flex items-center justify-end-safe mr-40">
          {/* Extra filter options */}
          <div className="absolute right-0 z-50 top-[-40px]">
            {searchData?.results?.length > 0 && (
              <p className="text-right font-semibold text-xs text-pink-600">
                {searchData.count} data found
              </p>
            )}
            {searchData?.results &&
              searchData?.results.map((seach, idx) => (
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
              setPage={setPage}
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
          {/* PRODUCTS AREA */}
          <div className="w-full">
            {isProductLoading ? (
              /* LOADING STATE (RIGHT SIDE ONLY) */
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-14 w-14 rounded-full border-4 border-purple-200 border-t-purple-600 animate-spin"></div>
                  <p className="text-gray-500 text-sm">Loading products...</p>
                </div>
              </div>
            ) : data?.result?.length === 0 ? (
              /* EMPTY STATE */
              <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
                <div className="bg-gray-100 p-6 rounded-full mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M10 10l4 4m0-4l-4 4m5-11a9 9 0 11-6.219 15.6"
                    />
                  </svg>
                </div>

                <h2 className="text-lg font-semibold text-gray-800">
                  No products found
                </h2>

                <p className="text-sm text-gray-500 mt-1 max-w-sm">
                  Try adjusting your filters or search keywords.
                </p>
              </div>
            ) : (
              /* PRODUCTS + PAGINATION */
              <>
                <div className="grid grid-cols-4 px-4 py-2 gap-6 w-full">
                  {data?.result?.map((prop) => (
                    <ProductCard key={prop._id} product={prop} />
                  ))}
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-center mt-12 mb-8 gap-3">
                  <button
                    onClick={handlePrev}
                    disabled={page === 1}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      page === 1
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <ChevronLeft size={18} />
                    Previous
                  </button>

                  <div className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700">
                    <span>Page</span>
                    <span className="text-blue-600 font-semibold">
                      {current}
                    </span>
                    <span className="text-gray-400">of</span>
                    <span className="font-semibold">{totalPages}</span>
                  </div>

                  <button
                    onClick={handleNext}
                    disabled={page === totalPages}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
                      page === totalPages
                        ? "border-gray-200 text-gray-400 cursor-not-allowed"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    Next
                    <ChevronRight size={18} />
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
