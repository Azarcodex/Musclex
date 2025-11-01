import React, { useState } from "react";
import { Navbar } from "../../components/user/Navbar";
import Footer from "../../components/user/Footer";
import { useGetProducts } from "../../hooks/users/useGetProducts";
import ProductCard from "../../components/user/ProductCard";
import {
  ArrowDown10,
  ArrowDownAZ,
  ArrowDownIcon,
  ArrowRightFromLineIcon,
  ChevronDown,
  DropletIcon,
  MoveRightIcon,
  WindArrowDown,
} from "lucide-react";
import FilterSidebar from "../../components/user/FilterSide";

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [priceRange, setPriceRange] = useState([0, 60000]);
  const [selectedRatings, setSelectedRatings] = useState([]);
  const [sortValue, setSortValue] = useState("");
  const [discountValue, setDiscountValue] = useState("");
  // console.log(typeof discountValue);
  const { data, isPending } = useGetProducts(
    selectedCategory,
    selectedBrands,
    priceRange,
    selectedRatings,
    sortValue,
    discountValue
  );
    console.log(data)
  // console.log(data);
  // if(isPending) return <h1>loading</h1>
  return (
    <div className="min-h-screen w-full">
      <Navbar />
      <div>
        <div className="mt-10 bg-gradient-to-br from-purple-50 to-blue-50 border-b-2 border-purple-950 flex items-center justify-between w-1/2 mx-auto px-3">
          {/*Extra filter options */}

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

          <h3 className="flex items-center gap-2">
            <span>xxx</span>
            <ChevronDown className="w-4 h-4" />
          </h3>
          <select
            value={discountValue}
            onChange={(e) => setDiscountValue(e.target.value)}
          >
            <option value="default">discount-</option>
            <option value="50">More than 50%</option>
            <option value="40">More than 40%</option>
            <option value="30">More than 30%</option>
            <option value="20">More than 20%</option>
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
