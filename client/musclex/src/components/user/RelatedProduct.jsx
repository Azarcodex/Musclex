import { Star, DollarSign } from "lucide-react";
import React from "react";

const RelatedProduct = ({ data }) => {
  const PORT = import.meta.env.VITE_API_URL;

  return (
    <div className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer w-56">
      {/* Image */}
      <div className="relative w-full h-48 bg-gray-50 overflow-hidden rounded-t-lg">
        <img
          src={`${PORT}${data.image}`}
          alt={data.name || "Product"}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-4 space-y-2.5">
        {/* Name */}
        <h5 className="font-semibold text-gray-900 text-base line-clamp-2 leading-tight">
          {data.name}
        </h5>

        {/* Rating */}
        <div className="flex items-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${
                i < (data.Avgrating || 0)
                  ? "fill-yellow-400 text-yellow-400"
                  : "fill-gray-200 text-gray-200"
              }`}
            />
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-2">
          <span className="flex items-center text-lg font-bold text-gray-900">
            <DollarSign className="w-4 h-4" />
            {data.salePrice}
          </span>
          {data.oldPrice > data.salePrice && (
            <span className="flex items-center text-sm text-gray-400 line-through">
              <DollarSign className="w-3.5 h-3.5" />
              {data.oldPrice}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default RelatedProduct;