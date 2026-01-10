import React from "react";
import { Package, Tag, Star, Calendar } from "lucide-react";

const ProductTable = ({ products }) => {
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
        🛍️ Product List
      </h2>

      <div className="overflow-x-auto bg-white shadow-2xl rounded-2xl border border-purple-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-purple-600 to-purple-500 text-white uppercase text-sm">
            <tr>
              <th className="py-4 px-6 text-left rounded-tl-2xl">#</th>
              <th className="py-4 px-6 text-left">Product Name</th>
              <th className="py-4 px-6 text-left">Description</th>
              <th className="py-4 px-6 text-left">Category</th>
              <th className="py-4 px-6 text-left">Brand</th>
              <th className="py-4 px-6 text-center">Avg Rating</th>
              <th className="py-4 px-6 text-center">Status</th>
              <th className="py-4 px-6 text-center rounded-tr-2xl">
                Created Date
              </th>
            </tr>
          </thead>

          <tbody>
            {products?.map((product, index) => (
              <tr
                key={product._id}
                className="border-b border-purple-100 hover:bg-purple-50 transition-all duration-200"
              >
                {/* Index */}
                <td className="py-4 px-6 text-gray-600 font-medium text-sm">
                  {index + 1}
                </td>

                {/* Product Name */}
                <td className="py-4 px-6 flex items-center gap-3 font-semibold text-gray-800">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Package className="text-purple-600 w-5 h-5" />
                  </div>
                  {product.name}
                </td>

                {/* Description */}
                <td className="py-4 px-6 text-gray-700 max-w-[200px] truncate">
                  {product.description || "—"}
                </td>

                {/* Category */}
                <td className="py-4 px-6 flex items-center gap-2 text-gray-700">
                  <Tag className="text-purple-500 w-4 h-4" />
                  {product.catgid?.catgName || "—"}
                </td>

                {/* Brand */}
                <td className="py-4 px-6 text-gray-700">
                  {product.brandID?.brand_name || "—"}
                </td>

                {/* Avg Rating */}
                <td className="py-4 px-6 text-center">
                  <div className="flex justify-center items-center gap-1 text-purple-600">
                    <Star className="w-4 h-4 fill-purple-500" />
                    <span className="font-semibold">{product.Avgrating}</span>
                  </div>
                </td>

                {/* Status */}
                <td className="py-4 px-6 text-center">
                  {product.isDeleted ? (
                    <span className="px-3 py-1 text-sm rounded-full bg-red-100 text-red-600 font-medium">
                      Deleted
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm rounded-full bg-green-100 text-green-700 font-medium">
                      Active
                    </span>
                  )}
                </td>

                {/* Created Date */}
                <td className="py-4 px-6 text-center text-gray-600 text-sm">
                  <div className="flex justify-center items-center gap-2">
                    <Calendar className="w-4 h-4 text-purple-500" />
                    {new Date(product.createdAt).toLocaleDateString()}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ProductTable;
