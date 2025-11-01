import React, { useState } from "react";
import { Store, Mail, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const VendorTable = ({ vendors }) => {
  const navigate = useNavigate();
  const [page,setPage]=useState(1)
  return (
    <div className="p-6">
      <h2 className="text-3xl font-bold text-purple-700 mb-6 text-center">
        🏬 Vendor List
      </h2>

      <div className="overflow-x-auto bg-white shadow-2xl rounded-2xl border border-purple-200">
        <table className="min-w-full border-collapse">
          <thead className="bg-gradient-to-r from-purple-600 to-purple-500 text-white uppercase text-sm">
            <tr>
              <th className="py-4 px-6 text-left rounded-tl-2xl">#</th>
              <th className="py-4 px-6 text-left">Shop Name</th>
              {/* <th className="py-4 px-6 text-left">Email</th> */}
              <th className="py-4 px-6 text-center">Total Products</th>
            </tr>
          </thead>

          <tbody>
            {vendors?.map((vendor, index) => (
              <tr
                key={vendor._id}
                className="border-b border-purple-100 hover:bg-purple-50 transition-all duration-200"
                onClick={() =>
                  navigate(
                    `/admin/dashboard/vendors/list/products/${vendor._id}`
                  )
                }
              >
                <td className="py-4 px-6 text-gray-600 font-medium">
                  {index + 1}
                </td>

                <td className="py-4 px-6 flex items-center gap-3 font-semibold text-gray-800">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Store className="text-purple-600 w-5 h-5" />
                  </div>
                  {vendor.shopName}
                </td>

                <td className="py-4 px-6 flex items-center gap-2 text-gray-700">
                  <Mail className="text-purple-500 w-4 h-4" />
                  {vendor.email}
                </td>

                <td className="py-4 px-6 text-center font-semibold text-purple-700">
                  <div className="inline-flex items-center gap-2">
                    <Package className="w-4 h-4 text-purple-600" />
                    {vendor.totalProducts}
                  </div>
                </td>

                {/* <td className="py-4 px-6 text-center">
                  {vendor.totalProducts > 0 ? (
                    <span className="px-3 py-1 text-sm rounded-full bg-purple-100 text-purple-700 font-medium">
                      Active
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm rounded-full bg-gray-100 text-gray-500 font-medium">
                      No Products
                    </span>
                  )}
                </td> */}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
       <div className="flex justify-center items-center gap-3 mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        //   onClick={handlePrev}
        //   disabled={page === 1}
        >
          previous
        </button>
        <span className="text-sm text-gray-700">
          Page 1
        </span>
        <button
        //   onClick={handleNext}
        //   disabled={page === data?.pagination?.totalPages}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          next
        </button>
      </div>
    </div>
  );
};

export default VendorTable;
