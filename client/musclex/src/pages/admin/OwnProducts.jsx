import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useVendorOwnProducts } from "../../hooks/admin/useVendorOwnProducts";
import ProductTable from "../../components/admin/ProductTable";
import DataTable from "../../components/utils/Table";
import { Eye, Search, VerifiedIcon } from "lucide-react";
import { confirm } from "../../components/utils/Confirmation.jsx";
import { toast } from "sonner";
import { useBlockProduct } from "../../hooks/admin/useBlockProduct";
import { useControlProductFeature } from "../../hooks/admin/useProductPermission";

const OwnProducts = () => {
  const { id } = useParams();

  //---searching and Pagination---
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounce, setDebounce] = useState(search);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDebounce(search);
    }, 500);
    return () => clearTimeout(timeOut);
  }, [search]);

  const { data, isPending } = useVendorOwnProducts(id, page, debounce);
  // console.log(data);
  const navigate = useNavigate();
  const { mutate: toggleProduct } = useBlockProduct();
  const { mutate: featureControl } = useControlProductFeature();
  const handleStatus = async (id) => {
    const wait = await confirm({ message: "do you want to make changes" });
    if (wait) {
      toggleProduct(id, {
        onSuccess: (data) => {
          toast.success(data.message);
        },
        onError: (err) => {
          toast.error(err.response.data.message);
        },
      });
    }
  };

  //handle featuring Product
  const handleFeatureProduct = async (id) => {
    const wait = await confirm({ message: "do you want to make changes" });
    if (wait) {
      featureControl(id, {
        onSuccess: (data) => {
          toast.success(data.message);
        },
        onError: (err) => {
          toast.error(err.response.data.message);
        },
      });
    }
  };

  const columns = [
    { header: "productName", accessorKey: "name" },
    { header: "description", accessorKey: "description" },
    { header: "category", accessorKey: "catgid.catgName" },
    { header: "brand", accessorKey: "brandID.brand_name" },
    { header: "rating", accessorKey: "Avgrating" },

    {
      header: "Date",
      cell: (info) => {
        const createdAt = info.row.original?.createdAt;
        if (!createdAt) return "N/A";

        const date = new Date(createdAt);
        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },

    {
      header: "Status",
      cell: (info) => {
        const product = info.row.original;

        return (
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => handleStatus(product._id)}
          >
            <Eye size={18} className="text-purple-700" />

            <span
              className={`${
                product.isActive ? "text-green-600" : "text-red-600"
              } text-sm font-medium`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Featured",
      cell: (info) => {
        const product = info.row.original;

        return (
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => handleFeatureProduct(product._id)}
          >
            <VerifiedIcon size={18} className="text-purple-700" />

            <span
              className={`${
                product.isFeatured ? "text-green-600" : "text-red-600"
              } text-sm font-medium`}
            >
              {product.isFeatured ? "yes" : "no"}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-md p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Products</h1>
              <p className="text-gray-600 mt-1">
                Manage your product inventory
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search products by name, category, or SKU..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="
                w-full pl-12 pr-4 py-3
                bg-white border-2 border-gray-300 rounded-lg
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                transition-all duration-200
                shadow-sm hover:shadow-md
              "
            />
          </div>
        </div>

        {/* Table Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <DataTable
            columns={columns}
            data={data?.products}
            isLoading={isPending}
            onPageChange={setPage}
            page={page}
            totalPages={data?.pagination?.totalPages}
          />
        </div>
      </div>
    </div>
  );
};

export default OwnProducts;
