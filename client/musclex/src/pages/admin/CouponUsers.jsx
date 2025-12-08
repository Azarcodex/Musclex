import React from "react";
import { useGetCouponUsers } from "../../hooks/admin/useCoupon";

const CouponUsers = () => {
  const { data, isLoading } = useGetCouponUsers();

  if (isLoading) return <p className="p-4">Loading...</p>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-semibold mb-4">Coupon Usage</h2>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-3">User</th>
              <th className="p-3">Email</th>
              <th className="p-3">Coupon Code</th>
              <th className="p-3">Type</th>
              <th className="p-3">Used Count</th>
              <th className="p-3">Used At</th>
            </tr>
          </thead>

          <tbody>
            {data?.usage?.length > 0 ? (
              data.usage.map((u) => (
                <tr key={u._id} className="border-b hover:bg-gray-50">
                  <td className="p-3">{u.userId?.name}</td>
                  <td className="p-3">{u.userId?.email}</td>

                  <td className="p-3">{u.couponId?.code}</td>
                  <td className="p-3 capitalize">{u.couponId?.discountType}</td>

                  <td className="p-3">{u.count}</td>

                  <td className="p-3">{u.usedAt?.split("T")[0]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="p-4 text-center text-gray-500">
                  No coupon usage found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CouponUsers;
