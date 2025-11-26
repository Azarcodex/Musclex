import React, { useEffect, useState } from "react";
import { Search, Edit2, Eye, Trash2, Plus, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useGetProducts } from "../../hooks/vendor/useGetProducts";
import { useProductVisible } from "../../hooks/vendor/useProductVisible";
import { confirm } from "../../components/utils/Confirmation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useProductDelete } from "../../hooks/vendor/useProductDelete";

const ProductsTable = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const { mutate: Delete } = useProductDelete();
  // console.log(data?.data);
  const { mutate: visibility } = useProductVisible();
  // console.log(data);
  const HandleVisible = async (id) => {
    const wait = await confirm({ message: "Do you want to make changes" });
    if (wait) {
      visibility(
        { id: id },
        {
          onSuccess: (data) => {
            toast.message(`${data?.message}`);
            queryClient.invalidateQueries(["products"]);
          },
          onError: (err) => {
            toast.error(`${err.response.data?.message}`);
          },
        }
      );
    }
  };
  const [searchQuery, setSearchQuery] = useState("");
  const [debounce, setDebounce] = useState(searchQuery);
  const { data, isLoading } = useGetProducts(page, debounce);
  useEffect(() => {
    const interval = setTimeout(() => {
      setDebounce(searchQuery);
    }, 600);
    return () => clearTimeout(interval);
  }, [searchQuery]);
  console.log(data?.data);
  if (isLoading)
    return <div className="text-center mt-10 text-gray-600">Loading...</div>;

  const products = data?.data || [];

  // const filteredProducts = products.filter((p) =>
  //   p.name.toLowerCase().includes(searchQuery.toLowerCase())
  // );
  const HandlePrev = () => {
    if (page > 0) {
      setPage((prev) => prev - 1);
    }
  };
  const HandleNext = () => {
    if (page < data?.totalPages) {
      setPage((prev) => prev + 1);
    }
  };
  const HandleDelete = async (id) => {
    const wait = await confirm({ message: "Do you want to delete it" });
    if (wait) {
      Delete(
        { id: id },
        {
          onSuccess: (data) => {
            toast.message(`${data.message}`);
            queryClient.invalidateQueries(["products"]);
          },
        }
      );
    }
  };
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-end gap-3 mb-6">
          {/* <h1 className="text-2xl font-semibold text-gray-800">Products</h1> */}
          <button
            onClick={() => navigate("/vendor/dashboard/products/add")}
            className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-5 py-2 rounded-md font-medium transition-colors"
          >
            <Plus size={18} />
            ADD PRODUCT
          </button>
          <button
             className="flex items-center gap-2 bg-purple-900 hover:bg-purple-700 text-white px-5 py-2 rounded-md font-medium transition-colors"
            onClick={() => navigate("/vendor/dashboard/products/offers")}
          >
            offers
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
                      <button
                        onClick={() =>
                          navigate(`/vendor/dashboard/products/edit/${p._id}`, {
                            state: { product: p },
                          })
                        }
                        className="p-2 hover:bg-gray-100 rounded-md"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-md"
                        onClick={() => HandleVisible(p._id)}
                      >
                        {p.isDeleted ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      <button
                        className="p-2 hover:bg-gray-100 rounded-md"
                        onClick={() => HandleDelete(p._id)}
                      >
                        <Trash2 size={16} />
                      </button>
                      <button
                        className="p-2 bg-purple-700 rounded-sm text-white hover:bg-purple-400"
                        onClick={() =>
                          navigate(`/vendor/dashboard/variant/add/${p._id}`)
                        }
                      >
                        Add Variant
                      </button>
                      <button
                        className="p-2 bg-pink-500 text-white hover:bg-pink-400 rounded-sm"
                        onClick={() =>
                          navigate(`/vendor/dashboard/variant/${p._id}`)
                        }
                      >
                        All variants
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
      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <button
          onClick={HandlePrev}
          disabled={page <= 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Prev
        </button>

        <span className="font-bold text-purple-900">
          Page {page} of {data?.totalPages}
        </span>

        <button
          onClick={HandleNext}
          // disabled={page >= totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default ProductsTable;
