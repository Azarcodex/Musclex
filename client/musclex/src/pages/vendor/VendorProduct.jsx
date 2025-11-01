import React, { useState } from "react";
import { Search, Edit2, Eye, Trash2, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetProducts } from "../../hooks/vendor/useGetProducts";

const ProductsTable = () => {
  const navigate = useNavigate();
  const { data, isLoading } = useGetProducts();
  const [searchQuery, setSearchQuery] = useState("");
  console.log(data?.data);
  if (isLoading)
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;

  const products = data?.data || [];

  // const filteredProducts = products.filter((p) =>
  //   p.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-gray-800">Products</h1>
          <button
            onClick={() => navigate("/add-product")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md font-medium transition-colors"
          >
            <Plus size={18} />
            ADD PRODUCT
          </button>
        </div>

        {/* Search */}
        <div className="bg-white rounded-lg shadow-sm mb-6 p-4 flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search here..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full border border-gray-300 rounded-md pl-10 pr-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Description
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Brand
                </th>
                <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr
                  key={p._id}
                  className="border-b border-gray-200 hover:bg-gray-50 transition"
                >
                  <td className="py-4 px-6 font-medium text-gray-900">
                    {p.name}
                  </td>
                  <td className="py-4 px-6 text-gray-600">{p.description}</td>
                  <td className="py-4 px-6 text-gray-700">
                    {p.catgid?.catgName || "—"}
                  </td>
                  <td className="py-4 px-6 text-gray-700">
                    {p.brandID?.brand_name || "—"}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-gray-100 rounded-md">
                        <Edit2 size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-md">
                        <Eye size={16} />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-md">
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-md"
                        onClick={() =>
                          navigate(`/vendor/dashboard/variant/add/${p._id}`)
                        }
                      >
                        Add Variant
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-md"
                        onClick={() =>
                          navigate(`/vendor/dashboard/variant/${p._id}`)
                        }
                      >
                        Variants
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Results Info */}
        <div className="mt-4 text-sm text-gray-600 text-right">
          Showing {products.length} Products
        </div>
      </div>
    </div>
  );
};

export default ProductsTable;
