import React, { useState, useEffect } from "react";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import { useGetVendors } from "../../hooks/admin/useGetVendors";
import { useProductPermission } from "../../hooks/admin/useProductPermission";
import { useStatusVendor } from "../../hooks/admin/useStatusVendor";
import { toast } from "sonner";
import { confirm } from "../../components/utils/Confirmation";

// ---------------- HELPERS ----------------
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return isNaN(d) ? "-" : d.toLocaleDateString("en-GB");
};

const getStatusBadge = (status) => {
  const map = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-semibold ${map[status]}`}
    >
      {status}
    </span>
  );
};

// ---------------- COMPONENT ----------------
export default function Vendors() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(t);
  }, [search]);

  const { data, isPending } = useGetVendors(
    page,
    debouncedSearch,
    statusFilter
  );

  const vendors = data?.vendors || [];
  const pagination = data?.pagination || {};

  const { mutate: updateStatus } = useStatusVendor();
  const { mutate: productPermission } = useProductPermission();

  // ---------------- ACTIONS ----------------
  const handleStatusChange = (vendorId, newStatus) => {
    setOpenDropdown(null);

    updateStatus(
      { vendorId, status: newStatus },
      {
        onSuccess: () => toast.success("Status updated"),
        onError: () => toast.error("Failed to update status"),
      }
    );
  };

  const toggleCanAddProduct = async (vendorId) => {
    const vendor = vendors.find((v) => v._id === vendorId);
    if (!vendor) return;

    const ok = await confirm({
      message: vendor.canAddProduct
        ? "Deny product permission?"
        : "Allow product permission?",
    });

    if (!ok) return;

    productPermission(
      { vendorId, canAddProduct: !vendor.canAddProduct },
      {
        onSuccess: () => toast.success("Permission updated"),
        onError: () => toast.error("Failed to update permission"),
      }
    );
  };

  if (isPending) {
    return (
      <div className="flex justify-center py-20">
        <div className="animate-spin h-10 w-10 border-b-2 border-purple-600" />
      </div>
    );
  }

  // ---------------- RENDER ----------------
  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-purple-600 text-white p-6 rounded-xl">
        <h1 className="text-3xl font-bold">Vendor Management</h1>
      </div>

      {/* SEARCH + FILTER */}
      <div className="bg-white p-4 rounded-xl shadow flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 text-gray-400" size={18} />
          <input
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search vendor..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
          />
        </div>

        <div className="relative">
          <button
            onClick={() => setShowFilterDropdown(!showFilterDropdown)}
            className="px-4 py-2 border rounded-lg flex items-center gap-2"
          >
            <Filter size={16} />
            {statusFilter}
            <ChevronDown size={14} />
          </button>

          {showFilterDropdown && (
            <div className="absolute right-0 mt-2 bg-white border rounded shadow w-40 z-10">
              {["all", "pending", "approved", "rejected"].map((s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatusFilter(s);
                    setPage(1);
                    setShowFilterDropdown(false);
                  }}
                  className="block w-full text-left px-4 py-2 hover:bg-gray-100 capitalize"
                >
                  {s}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white rounded-xl shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              {[
                "#",
                "Shop",
                "Email",
                "Phone",
                "Status",
                "Can Add Product",
                "Created",
              ].map((h) => (
                <th key={h} className="p-3 text-left text-xs font-bold">
                  {h}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {vendors.map((v, i) => (
              <tr key={v._id} className="border-t hover:bg-gray-50">
                <td className="p-3">
                  {(pagination.currentPage - 1) * pagination.limit + i + 1}
                </td>
                <td className="p-3 font-semibold">{v.shopName}</td>
                <td className="p-3">{v.email}</td>
                <td className="p-3">{v.phone}</td>

                {/* STATUS DROPDOWN */}
                <td className="p-3 relative">
                  <div
                    onClick={() =>
                      setOpenDropdown(openDropdown === v._id ? null : v._id)
                    }
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    {getStatusBadge(v.status)}
                    <ChevronDown size={14} />
                  </div>

                  {openDropdown === v._id && (
                    <div className="absolute z-20 mt-2 bg-white border rounded shadow w-32">
                      {["pending", "approved", "rejected"].map((s) => (
                        <div
                          key={s}
                          onClick={() => handleStatusChange(v._id, s)}
                          className="px-4 py-2 text-sm hover:bg-gray-100 capitalize cursor-pointer"
                        >
                          {s}
                        </div>
                      ))}
                    </div>
                  )}
                </td>

                {/* PRODUCT PERMISSION */}
                <td className="p-3">
                  <button
                    onClick={() => toggleCanAddProduct(v._id)}
                    className="text-sm font-semibold text-purple-600"
                  >
                    {v.canAddProduct ? "Yes" : "No"}
                  </button>
                </td>

                <td className="p-3">{formatDate(v.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center gap-4">
        <button onClick={() => setPage((p) => p - 1)} disabled={page === 1}>
          <ChevronLeft />
        </button>
        <span>
          Page {pagination.currentPage} of {pagination.totalPages}
        </span>
        <button
          onClick={() => setPage((p) => p + 1)}
          disabled={page === pagination.totalPages}
        >
          <ChevronRight />
        </button>
      </div>
    </div>
  );
}
