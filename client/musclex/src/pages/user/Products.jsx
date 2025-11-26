import React, { useEffect, useState } from "react";
import { Navbar } from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import ProductCard from "../../components/user/ProductCard";
import FilterSidebar from "../../components/user/FilterSide";
import { useProductFetch } from "../../hooks/users/useProductFetch";
import { useSelector } from "react-redux";
import { useSearch } from "../../hooks/users/useSearch";
import SearchData from "../../components/user/SearchData";
const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 60000]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortValue, setSortValue] = useState("");
  const { data } = useProductFetch(
    selectedCategory,
    selectedBrands,
    priceRange,
    selectedRatings,
    sortValue
  );
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

  // const isSearch = Boolean(debounce) && isLoading;

  // if (isSearch) {
  //   return <p>Loading data</p>;
  // }
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div>
        <div className="relative mt-10 bg-white   flex items-center justify-end-safe  mr-40">
          {/*Extra filter options */}
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
          >
            <option value="default">view:</option>
            <option value="sortAZ">A-Z </option>
            <option value="sortZA">Z-A</option>
            <option value="sort01">ASC</option>
            <option value="sort10">DESC</option>
          </select>

          {/* <h3 className="flex items-center gap-2">
            <span>xxx</span>
            <ChevronDown className="w-4 h-4" />
          </h3> */}
          {/* <select
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          >
            <option value="default">discount-</option>
            <option value="50">More than 50%</option>
            <option value="40">More than 40%</option>
            <option value="30">More than 30%</option>
            <option value="20">More than 20%</option>
          </select> */}
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
          <div className=" grid grid-cols-4  px-4 py-2 gap-6 w-full">
            {data?.result?.map((prop) => (
              <ProductCard key={prop._id} product={prop} />
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Products;
