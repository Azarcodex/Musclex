import { useState } from "react";
import { ChevronDown, ChevronUp, Star } from "lucide-react";
import { usegetCategories } from "../../hooks/users/usegetCategories";
import { useGetBrands } from "../../hooks/users/useGetBrands";
import { Range } from "react-range";
import PriceRangeSlider from "./Slider";
export default function FilterSidebar({
  selectedCategory,
  setSelectedCategory,
  selectedBrands,
  setSelectedBrands,
  priceRange,
  setPriceRange,
  selectedRatings,
  setSelectedRatings,
}) {
  const [isCategoryOpen, setIsCategoryOpen] = useState(true);
  const { data, isPending } = usegetCategories();
  const { data: Brands, isPending: isLoading } = useGetBrands();
  // console.log(selectedRatings)
  const toggleCategory = (id) => {
    setSelectedCategory((prev) =>
      prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
    );
  };
  // console.log(selectedRatings)
  const toggleRating = (rating) => {
    setSelectedRatings((prev) =>
      prev.includes(rating)
        ? prev.filter((r) => r !== rating)
        : [...prev, rating]
    );
  };
  const toggleBrand = (id) => {
    setSelectedBrands((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    );
  };

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <span key={i} className="text-yellow-400 text-lg">
        {i < count ? (
          <Star className="text-green-500 w-4 h-4" />
        ) : (
          <Star className="w-4 h-4 text-red-500" />
        )}
      </span>
    ));
  };

  return (
    <div className="w-72 bg-white border-l-4 border-violet-500 p-6">
      {/* Shop by Category */}
      <div className="mb-6">
        <button
          onClick={() => setIsCategoryOpen(!isCategoryOpen)}
          className="flex items-center justify-between w-full mb-4"
        >
          <h3 className="text-gray-900 font-semibold text-lg">
            Shop by Category
          </h3>
          {isCategoryOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {isCategoryOpen && (
          <div className="space-y-3">
            {data?.map((cat) => (
              <label
                key={cat._id}
                className="flex items-center gap-2 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCategory.includes(cat._id)}
                  onChange={() => toggleCategory(cat._id)}
                  className="w-5 h-5 accent-red-500"
                />
                <span className="text-gray-700">{cat.catgName}</span>
              </label>
            ))}
          </div>
        )}
      </div>
      {/* Filter By Price */}
      <div className="mb-6">
        <h3 className="text-gray-900 font-semibold text-lg mb-4">
          Filter By Price
        </h3>
        <PriceRangeSlider
          priceRange={priceRange}
          setPriceRange={setPriceRange}
        />
        <div className="flex justify-between mt-2 text-sm text-gray-600">
          <span>
            From: <span className="font-semibold">Rs: {priceRange[0]}</span>
          </span>
          <span>
            To: <span className="font-semibold">Rs: {priceRange[1]}</span>
          </span>
        </div>
      </div>
      {/* {//Filter By Rating} */}
      <div className="mb-6">
        <h3 className="text-gray-900 font-semibold text-lg mb-4">
          Filter By Rating
        </h3>
        <div className="space-y-3">
          {[5, 4, 3, 2, 1].map((rating) => (
            <label
              key={rating}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedRatings.includes(rating)}
                onChange={() => toggleRating(rating)}
                className="w-5 h-5 accent-red-500"
              />
              <div className="flex gap-1">{renderStars(rating)}</div>
            </label>
          ))}
        </div>
      </div>
      {/* Filter By Discount */}
      {/* <div className="mb-6">
        <h3 className="text-gray-900 font-semibold text-lg mb-4">
          Filter By Discount
        </h3>
        <div className="space-y-3">
          {[50, 40, 30, 20, 10].map((discount) => (
            <label
              key={discount}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <input
                type="checkbox"
                // checked={selectedDiscounts.includes(discount)}
                // onChange={() => toggleDiscount(discount)}
                className="w-5 h-5 accent-green-600 transition-transform group-hover:scale-110"
              />
              <span
                className={`text-sm font-medium transition-colors group-hover:text-green-600 ${
                  selectedDiscounts.includes(discount)
                    ? "text-green-600"
                    : "text-gray-700"
                }`}
              >
                {`More than ${discount}% Off`}
              </span>
            </label>
          ))}
        </div>
      </div> */}
      {/* Brand */}
      <div>
        <h3 className="text-gray-900 font-semibold text-lg mb-4">Brand</h3>
        <div className="space-y-3">
          {Brands?.map((brand) => (
            <label
              key={brand._id}
              className="flex items-center gap-2 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand._id)}
                onChange={() => toggleBrand(brand._id)}
                className="w-5 h-5 accent-red-500"
              />
              <span className="text-gray-700">{brand.brand_name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
