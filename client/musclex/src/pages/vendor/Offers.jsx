import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useCreateProductOffer,
  useGetAllVendorProducts,
  useGetProductOffers,
} from "../../hooks/vendor/useOffer";

export default function ProductOffers() {
  const [open, setOpen] = useState(false);

  const { data: productData } = useGetAllVendorProducts();
  const { data: offersData } = useGetProductOffers();
  const { mutate: createOffer } = useCreateProductOffer();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      productIds: [],
      discountType: "",
      value: "",
      startDate: "",
      endDate: "",
    },
  });

  const onSubmit = (formData) => {
    const payload = {
      ...formData,
      productIds: formData.productIds,
    };

    createOffer(payload, {
      onSuccess: (res) => {
        toast.success(res.message);
        reset();
        setOpen(false);
      },
      onError: (err) => {
        toast.error(err.response.data.message);
      },
    });
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Product Offers</h1>
        <button
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          onClick={() => setOpen(true)}
        >
          Add Offer
        </button>
      </div>

      {/* =================== MODAL =================== */}
      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg shadow-xl p-6">
            <h2 className="text-xl font-semibold mb-4">Add Product Offer</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
              <div>
                <label className="text-sm font-medium">Select Products</label>

                <div
                  className="border border-purple-300 rounded-lg p-2 mt-1 max-h-40
                             overflow-y-auto bg-white"
                >
                  {productData?.products?.map((prod) => {
                    const selected = watch("productIds")?.includes(prod._id);

                    return (
                      <div
                        key={prod._id}
                        onClick={() => {
                          const current = watch("productIds") || [];
                          if (selected) {
                            setValue(
                              "productIds",
                              current.filter((id) => id !== prod._id)
                            );
                          } else {
                            setValue("productIds", [...current, prod._id]);
                          }
                        }}
                        className={`cursor-pointer px-3 py-2 rounded-lg mb-1 transition-all
                          ${
                            selected
                              ? "bg-purple-600 text-white shadow-sm"
                              : "bg-gray-100 text-gray-800 hover:bg-purple-100"
                          }`}
                      >
                        {prod.name}
                      </div>
                    );
                  })}
                </div>

                {errors.productIds && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.productIds.message}
                  </p>
                )}
              </div>

              {/* Discount Type */}
              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <select
                  {...register("discountType", { required: "Required" })}
                  className="w-full border p-2 rounded mt-1"
                >
                  <option value="">Select type</option>
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
              </div>

              {/* Value */}
              <div>
                <label className="text-sm font-medium">Value</label>
                <input
                  type="number"
                  {...register("value", {
                    required: "Required",
                    min: { value: 1, message: "Minimum value is 1" },
                  })}
                  placeholder="Enter discount value"
                  className="w-full border p-2 rounded mt-1"
                />
                {errors.value && (
                  <p className="text-red-500 text-xs">{errors.value.message}</p>
                )}
              </div>

              {/* Dates */}
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  {...register("startDate", { required: "Required" })}
                  className="w-full border p-2 rounded mt-1"
                />
              </div>

              <div>
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  {...register("endDate", { required: "Required" })}
                  className="w-full border p-2 rounded mt-1"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =================== TABLE =================== */}
      <div className="mt-10 bg-white shadow-md rounded-lg overflow-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-purple-600 text-white">
            <tr>
              <th className="p-3 text-left">Products</th>
              <th className="p-3 text-left">Discount</th>
              <th className="p-3 text-left">Value</th>
              <th className="p-3 text-left">Start</th>
              <th className="p-3 text-left">End</th>
            </tr>
          </thead>

          <tbody>
            {offersData?.offers?.length > 0 ? (
              offersData.offers.map((offer) => (
                <tr key={offer._id} className="border-b">
                  <td className="p-3">
                    {offer.productIds?.map((p) => p.name).join(", ")}
                  </td>
                  <td className="p-3 capitalize">{offer.discountType}</td>
                  <td className="p-3">{offer.value}</td>
                  <td className="p-3">{offer.startDate.split("T")[0]}</td>
                  <td className="p-3">{offer.endDate.split("T")[0]}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No product offers yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
