import React, { useState, useEffect } from "react";
import { CheckCircle, XCircle, ChevronDown } from "lucide-react";
import { useGetVendors } from "../../hooks/admin/useGetVendors";
import { useProductPermission } from "../../hooks/admin/useProductPermission";
import { useStatusVendor } from "../../hooks/admin/useStatusVendor";
import { toast } from "sonner";
import { confirm } from "../../components/utils/Confirmation";
// Helper: format date
const formatDate = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

// Helper: status badge
const getStatusBadge = (status) => {
  const colors = {
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
  };
  return (
    <span
      className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colors[status]}`}
    >
      {status || "-"}
    </span>
  );
};

export default function Vendors() {
  const [page, setpage] = useState(1);
  const handlePrev = () => {
    if (page > 1) setpage((prev) => prev - 1);
  };
  const handleNext = () => {
    console.log("clicked");
    if (page < data?.pagination?.totalPages) {
      setpage((prev) => prev + 1);
    }
  };
  const { data, isPending } = useGetVendors(page);
  const { mutate: updateStatus } = useStatusVendor();
  const { mutate: productPermission } = useProductPermission();

  const [vendors, setVendors] = useState([]);
  const [openDropdown, setOpenDropdown] = useState(null);

  // Initialize vendors state
  useEffect(() => {
    if (data?.vendors) {
      setVendors(
        data.vendors.map((v, i) => ({
          ...v,
          id: v.id ?? v._id ?? `vendor-${i}`,
        }))
      );
    }
  }, [data]);
  // useEffect(() => {
  //   if (data?.vendors) {
  //     const mapping = data.vendors.map((v, i) => ({
  //       ...v,
  //       id: v.id ?? v._id ?? `vendor-${i}`,
  //     }));
  //     console.log(mapping);
  //   }
  // }, [data]);

  // Handle status change
  const handleStatusChange = (vendorId, newStatus) => {
    console.log(newStatus);
    // find vendor before modifying state (avoid stale reads)
    const vendor = vendors.find((v) => v.id === vendorId);
    if (!vendor) return;

    const backendId = vendor._id ?? vendor.id;

    // Optimistic UI update
    setVendors((prev) =>
      prev.map((v) => (v.id === vendorId ? { ...v, status: newStatus } : v))
    );
    setOpenDropdown(null);

    updateStatus(
      { vendorId: backendId, id: backendId, status: newStatus },
      {
        onSuccess: () => toast.success(`Status updated to ${newStatus}`),
        onError: () => {
          toast.error("Failed to update status");
          // rollback on error
          setVendors((prev) =>
            prev.map((v) =>
              v.id === vendorId ? { ...v, status: vendor.status } : v
            )
          );
        },
      }
    );
  };

  // Toggle Can Add Product
  const toggleCanAddProduct = async (vendorId) => {
    const message = vendors
      .filter((v) => v._id === vendorId)
      .map((v) =>
        v.canAddProduct === true
          ? "Do you want to deny permission"
          : "Do you want to allow permission"
      );
    const wait = await confirm({ message: message });
    if (wait) {
      const vendor = vendors.find((v) => v.id === vendorId);
      if (!vendor) return;

      const backendId = vendor._id ?? vendor.id;
      //copying the vendor previous state
      const prevValue = !!vendor.canAddProduct;
      const newValue = !prevValue;
      // Optimistic UI
      setVendors((prev) =>
        prev.map((v) =>
          v.id === vendorId ? { ...v, canAddProduct: newValue } : v
        )
      );

      productPermission(
        { vendorId: backendId, canAddProduct: newValue },
        {
          onSuccess: () => toast.success("Product permission updated"),
          onError: () => {
            toast.error("Failed to update permission");
            // rollback
            setVendors((prev) =>
              prev.map((v) =>
                v.id === vendorId ? { ...v, canAddProduct: prevValue } : v
              )
            );
          },
        }
      );
    }
  };
  const current = data?.pagination.currentPage;
  const limit = data?.pagination?.limit;
  if (isPending) return <p className="p-6 text-gray-500">Loading vendors...</p>;

  return (
    <div className="w-full">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto max-h-[80vh] overflow-y-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                {[
                  "#",
                  "Shop Name",
                  "Email",
                  "Phone",
                  "Place",
                  "Status",
                  "Can Add Product",
                  "Created At",
                ].map((head) => (
                  <th
                    key={head}
                    className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {vendors.map((vendor, index) => (
                <tr
                  key={vendor.id}
                  className="hover:bg-gray-50 transition-colors"
                >
                  <td className="px-6 py-4 text-sm text-gray-700">
                    {(current - 1) * limit + index + 1}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {vendor.shopName}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {vendor.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {vendor.phone}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {vendor.place}
                  </td>

                  {/* Status dropdown */}
                  <td className="px-6 py-4 relative">
                    <div
                      className="flex items-center gap-2 cursor-pointer"
                      onClick={() =>
                        setOpenDropdown(
                          openDropdown === vendor.id ? null : vendor.id
                        )
                      }
                    >
                      {getStatusBadge(vendor.status)}
                      <ChevronDown size={16} className="text-gray-500" />
                    </div>
                    {openDropdown === vendor.id && (
                      <div
                        className="absolute left-0 top-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg w-36 z-20"
                        onMouseLeave={() => setOpenDropdown(null)}
                      >
                        {["pending", "approved", "rejected"].map((status) => (
                          <div
                            key={status}
                            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer first:rounded-t-lg last:rounded-b-lg"
                            onClick={() =>
                              handleStatusChange(vendor.id, status)
                            }
                          >
                            {status}
                          </div>
                        ))}
                      </div>
                    )}
                  </td>

                  {/* Can Add Product */}
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => toggleCanAddProduct(vendor.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition ${
                        vendor.canAddProduct
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-800 hover:bg-gray-200"
                      }`}
                    >
                      {vendor.canAddProduct ? (
                        <>
                          <CheckCircle size={14} /> Yes
                        </>
                      ) : (
                        <>
                          <XCircle size={14} /> No
                        </>
                      )}
                    </button>
                  </td>

                  <td className="px-6 py-4 text-sm text-gray-600">
                    {formatDate(vendor.createdAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/*Pagination controls */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          onClick={handlePrev}
          disabled={page === 1}
        >
          previous
        </button>
        <span className="text-sm text-gray-700">
          Page {data?.pagination?.currentPage} of {data?.pagination?.totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === data?.pagination?.totalPages}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          next
        </button>
      </div>
    </div>
  );
}
