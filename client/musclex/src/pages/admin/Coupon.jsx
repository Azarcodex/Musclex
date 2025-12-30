import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Eye, EyeOff, Pencil } from "lucide-react";
import {
  useCreateCoupon,
  useGetCoupons,
  useToggleCouponStatus,
  useUpdateCoupon,
} from "../../hooks/admin/useCoupon";
import { confirm } from "../../components/utils/Confirmation";
import { useNavigate } from "react-router-dom";

export default function CouponManagement() {
  const [open, setOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const navigate = useNavigate();
  const { data: coupons } = useGetCoupons();
  const { mutate: createCoupon } = useCreateCoupon();
  const { mutate: updateCoupon } = useUpdateCoupon();
  const { mutate: toggleVisibility } = useToggleCouponStatus();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: "",
      discountType: "",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      usagePerUser: "",
    },
  });

  useEffect(() => {
    if (!open) {
      reset({
        code: "",
        discountType: "",
        discountValue: "",
        minPurchase: "",
        maxDiscount: "",
        startDate: "",
        endDate: "",
        usageLimit: "",
        usagePerUser: "",
      });
      setEditData(null);
    }
  }, [open]);

  const openCreateModal = () => {
    setEditData(null);
    reset({
      code: "",
      discountType: "",
      discountValue: "",
      minPurchase: "",
      maxDiscount: "",
      startDate: "",
      endDate: "",
      usageLimit: "",
      usagePerUser: "",
    });
    setOpen(true);
  };

  const handleEdit = (c) => {
    setEditData(c);
    reset({
      code: c.code,
      discountType: c.discountType,
      discountValue: c.discountValue,
      minPurchase: c.minPurchase,
      maxDiscount: c.maxDiscount,
      startDate: c.startDate.split("T")[0],
      endDate: c.endDate.split("T")[0],
      usageLimit: c.usageLimit,
      usagePerUser: c.usagePerUser,
    });
    setOpen(true);
  };

  const onSubmit = (data) => {
    if (editData) {
      updateCoupon(
        { id: editData._id, payload: data },
        {
          onSuccess: (res) => {
            toast.success(res.message);
            setOpen(false);
          },
          onError: (err) => toast.error(err.response.data.message),
        }
      );
    } else {
      createCoupon(data, {
        onSuccess: (res) => {
          toast.success(res.message);
          setOpen(false);
        },
        onError: (err) => toast.error(err.response.data.message),
      });
    }
  };

  const handleVisibility = async (coupon) => {
    const wait = await confirm({ message: "Do you want to make changes" });
    if (wait) {
      toggleVisibility(coupon._id, {
        onSuccess: (res) => toast.success(res.message),
        onError: (err) => toast.error(err.response.data.message),
      });
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Coupon Management</h1>
        <div className="flex justify-end gap-4">
          <button
            onClick={openCreateModal}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Add Coupon
          </button>
          <button
            onClick={() => navigate("/admin/dashboard/couponUsers")}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            CouponUsers
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editData ? "Update Coupon" : "Create Coupon"}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Coupon Code</label>
                <input
                  type="text"
                  {...register("code", { required: "Coupon code is required" })}
                  className="w-full border p-2 rounded mt-1"
                />
                {errors.code && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.code.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <select
                  {...register("discountType", {
                    required: "Select a discount type",
                  })}
                  className="w-full border p-2 rounded mt-1"
                >
                  <option value="">Select</option>
                  <option value="percent">Percent (%)</option>
                  {/* <option value="flat">Flat (₹)</option> */}
                </select>
                {errors.discountType && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Discount Value</label>
                <input
                  type="number"
                  {...register("discountValue", {
                    required: "Enter discount value",
                  })}
                  className="w-full border p-2 rounded mt-1"
                />
                {errors.discountValue && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.discountValue.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Minimum Purchase</label>
                <input
                  type="number"
                  {...register("minPurchase", {
                    required: "Enter minimum purchase amount",
                  })}
                  className="w-full border p-2 rounded mt-1"
                />
                {errors.minPurchase && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.minPurchase.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Maximum Discount</label>
                <input
                  type="number"
                  {...register("maxDiscount")}
                  className="w-full border p-2 rounded mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <input
                    type="date"
                    {...register("startDate", {
                      required: "Start date required",
                    })}
                    className="w-full border p-2 rounded mt-1"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.startDate.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <input
                    type="date"
                    {...register("endDate", { required: "End date required" })}
                    className="w-full border p-2 rounded mt-1"
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.endDate.message}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Usage Limit</label>
                <input
                  type="number"
                  {...register("usageLimit")}
                  className="w-full border p-2 rounded mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Usage Per User</label>
                <input
                  type="number"
                  {...register("usagePerUser")}
                  className="w-full border p-2 rounded mt-1"
                />
              </div>

              <div className="flex justify-end gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                >
                  Cancel
                </button>

                <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700">
                  {editData ? "Update" : "Save"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-10 bg-white rounded-lg shadow-md overflow-hidden">
        <table className="w-full">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-3 text-left">Code</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Value</th>
              <th className="p-3 text-left">Min Purchase</th>
              <th className="p-3 text-left">Max Discount</th>
              <th className="p-3 text-left">Used</th>
              <th className="p-3 text-left">Used Per User</th>
              <th className="p-3 text-left">Validity</th>
              <th className="p-3 text-left">Actions</th>
            </tr>
          </thead>

          <tbody>
            {coupons?.coupons?.map((c) => (
              <tr key={c._id} className="border-b">
                <td className="p-3 font-semibold text-purple-700">{c.code}</td>
                <td className="p-3 capitalize">{c.discountType}</td>
                <td className="p-3">
                  {c.discountType === "percent"
                    ? `${c.discountValue}%`
                    : `₹${c.discountValue}`}
                </td>
                <td className="p-3">₹{c.minPurchase}</td>
                <td className="p-3">{c.maxDiscount || "-"}</td>
                <td className="p-3">{c.usageLimit || "∞"}</td>
                <td className="p-3">{c.usagePerUser}</td>
                <td className="p-3">
                  {c.startDate.split("T")[0]} → {c.endDate.split("T")[0]}
                </td>

                <td className="p-3">
                  <div className="flex items-center gap-4">
                    <Pencil
                      className="w-5 h-5 text-blue-600 cursor-pointer"
                      onClick={() => handleEdit(c)}
                    />

                    {!c.isActive ? (
                      <EyeOff
                        className="w-5 h-5 text-red-600 cursor-pointer"
                        onClick={() => handleVisibility(c)}
                      />
                    ) : (
                      <Eye
                        className="w-5 h-5 text-green-600 cursor-pointer"
                        onClick={() => handleVisibility(c)}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
