import React, { useEffect, useState } from "react";
import { useGetVendorProducts } from "../../hooks/admin/useGetVendorProducts";
import DataTable from "../../components/utils/Table";
import { useNavigate } from "react-router-dom";
import { Search, Store, Package } from "lucide-react";

const ProductVendor = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounce, setDebounce] = useState(search);

  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDebounce(search);
    }, 500);
    return () => clearTimeout(timeOut);
  }, [search]);

  const limit = 5;
  const { data, isPending } = useGetVendorProducts(page, limit, debounce);

  const handleProductId = (id) => {
    navigate(`/admin/dashboard/vendors/list/products/${id}`);
  };

  const columns = [
    {
      header: "#",
      cell: (info) => (
        <span className="font-semibold text-gray-600">
          {(page - 1) * limit + info.row.index + 1}
        </span>
      ),
    },
    {
      header: "Shop Name",
      accessorKey: "shopName",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <Store className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-medium text-gray-900">{info.getValue()}</span>
        </div>
      ),
    },
    {
      header: "Email",
      accessorKey: "email",
      cell: (info) => <span className="text-gray-600">{info.getValue()}</span>,
    },
    {
      header: "Total Products",
      accessorKey: "totalProducts",
      cell: (info) => (
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-purple-500" />
          <span className="font-semibold text-purple-700">
            {info.getValue()}
          </span>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vendor Products
          </h1>
          <p className="text-gray-600">
            Manage and view all vendor products in one place
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="search"
              placeholder="Search by shop name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="
                w-full pl-12 pr-4 py-3
                bg-white border border-gray-300 rounded-lg
                text-gray-900 placeholder-gray-400
                focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent
                transition-all duration-200
                shadow-sm hover:shadow-md
              "
            />
          </div>
        </div>

        {/* Data Table */}
        <DataTable
          columns={columns}
          data={data?.vendors}
          isLoading={isPending}
          onPageChange={setPage}
          page={page}
          totalPages={data?.pagination.totalPages}
          onRowChange={handleProductId}
        />
      </div>
    </div>
  );
};

export default ProductVendor;
