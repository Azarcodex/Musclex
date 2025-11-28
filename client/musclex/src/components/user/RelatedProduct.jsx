import { Star, Tag, TrendingUp } from "lucide-react";
import React from "react";
import { useNavigate } from "react-router-dom";

const RelatedProduct = ({ data }) => {
  const navigate = useNavigate();
  const PORT = import.meta.env.VITE_API_URL;

  const discountPercentage =
    data.oldPrice > 0
      ? Math.round(((data.oldPrice - data.salePrice) / data.oldPrice) * 100)
      : 0;

  const offerApplied = data.offerApplied === true;
  const finalPrice = offerApplied ? data.finalPrice : data.salePrice;

  return (
    <div
      onClick={() => {
        navigate(`/user/products/${data._id}`);
        setTimeout(() =>
          window.scrollTo({ top: 0, left: 0, behavior: "auto" }, 0)
        );
      }}
      className="group bg-white rounded-2xl shadow-md hover:shadow-2xl transition-all duration-500 cursor-pointer w-64 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:scale-[1.03]"
    >
      {/* Image Container */}
      <div className="relative bg-gradient-to-br from-purple-50 via-white to-pink-50 p-4 h-56 flex items-center justify-center">
        {/* Discount Badge */}
        {discountPercentage > 0 && !offerApplied && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10">
            <Tag className="w-3 h-3" />
            {discountPercentage}% OFF
          </div>
        )}

        {/* Offer Badge */}
        {offerApplied && (
          <div className="absolute top-3 left-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white px-2 py-1.5 rounded-full text-xs font-bold shadow-lg flex items-center gap-1 z-10 animate-pulse">
            <TrendingUp className="w-3 h-3" />
            SPECIAL OFFER
          </div>
        )}

        {/* Product Image */}
        <img
          src={`${PORT}${data.image}`}
          alt={data.name}
          className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
        />

        {/* Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Brand */}
        {data.brand && (
          <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide mb-1">
            {data.brand}
          </p>
        )}

        {/* Product Name */}
        <h3 className="text-base font-bold text-gray-900 mb-3 line-clamp-2 leading-tight group-hover:text-purple-700 transition-colors">
          {data.name}
        </h3>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-4">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-4 h-4 ${
                i < (data.rating || 0)
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300 fill-gray-300"
              }`}
            />
          ))}
          {data.rating && (
            <span className="ml-1 text-xs text-gray-600 font-medium">
              ({data.rating.toFixed(1)})
            </span>
          )}
        </div>

        {/* Price Section */}
        <div className="space-y-2">
          {offerApplied ? (
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-xl font-black text-purple-600">
                  ₹{finalPrice}
                </span>
                {data.oldPrice > finalPrice && (
                  <span className="text-sm text-gray-400 line-through">
                    ₹{data.oldPrice}
                  </span>
                )}
              </div>

              {data.offerValue && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">
                    Original: ₹{data.salePrice}
                  </span>
                  <span className="bg-purple-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">
                    {data.offerType === "percent"
                      ? `${data.offerValue}% OFF`
                      : `₹${data.offerValue} OFF`}
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-black text-purple-900">
                ₹{data.salePrice}
              </span>
              {data.oldPrice > data.salePrice && (
                <span className="text-sm text-gray-400 line-through">
                  ₹{data.oldPrice}
                </span>
              )}
            </div>
          )}

          {/* Savings Indicator */}
          {data.oldPrice > finalPrice && (
            <div className="flex items-center gap-1 text-xs text-purple-700 font-semibold">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Save ₹{data.oldPrice - finalPrice}</span>
            </div>
          )}
        </div>

        {/* View Details Hint */}
        <div className="mt-4 pt-3 border-t border-gray-100">
          <p className="text-xs text-center text-purple-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            Click to view details →
          </p>
        </div>
      </div>
    </div>
  );
};

export default RelatedProduct;
