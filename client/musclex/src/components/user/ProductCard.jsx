import { Heart, ShoppingCart } from "lucide-react";

export default function ProductCard({ product }) {
  return (
    <div className="w-60 bg-white rounded-lg shadow-md overflow-hidden">
      {/* Image Container */}
      <div className="relative bg-gray-100">
        <img
          src={product.prevImage}
          alt={product.name}
          className="w-full h-30 object-contain"
        />

        {/* Discount Badge */}
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {product.discount}%
        </div>

        {/* Heart Icon */}
        <button className="absolute top-4 right-4 bg-white p-2 rounded-full hover:bg-gray-100">
          <Heart className="w-6 h-6 text-gray-700" />
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        <p className="text-gray-600 text-sm mb-1">{product.brand}</p>

        {/* Product Name */}
        <h3 className="text-gray-900 font-semibold mb-2">{product.name}</h3>

        {/* Rating */}
        <div className="flex gap-1 mb-3">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-xl">
              {i < product.Avgrating ? "⭐" : "☆"}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-gray-400 line-through text-sm">
            ₹{product.totalStock}
          </span>
          <span className="text-red-500 text-xl font-bold">
            ₹{product.salePrice}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full border-2 border-red-500 text-red-500 py-1 rounded-md flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
          <ShoppingCart className="w-3 h-3" />
          <span className="font-semibold text-sm">ADD TO CART</span>
        </button>
      </div>
    </div>
  );
}
