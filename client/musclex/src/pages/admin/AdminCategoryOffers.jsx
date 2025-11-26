import React, { useState } from "react";
import { useForm } from "react-hook-form";
import {
  useCreateOffer,
  useEditOffers,
  usegetOffers,
  useOfferVisibility,
} from "../../hooks/admin/useAdminOffer";
import { toast } from "sonner";
import { usegetAllCategory } from "../../hooks/admin/useGetAllCategory";
import { Eye, EyeOff, Pencil } from "lucide-react";
import { confirm } from "../../components/utils/Confirmation";

export default function AdminCategoryOffers() {
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const { data: CategoryList } = usegetAllCategory();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      categoryId: "",
      discountType: "",
      value: "",
      startDate: "",
      endDate: "",
    },
  });
  const {
    register: editRegister,
    handleSubmit: handleEditSubmit,
    reset: editReset,
    setValue: setEditValue,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: {
      categoryId: "",
      discountType: "",
      value: "",
      startDate: "",
      endDate: "",
    },
  });
  const { mutate: createOffer } = useCreateOffer();
  const { data: availableOffers } = usegetOffers();
  const { mutate: UpdateOffers } = useEditOffers();
  const { mutate: OfferVisibility } = useOfferVisibility();
  const onSubmit = (data) => {
    createOffer(data, {
      onSuccess: (data) => {
        toast.success(data.message);
        setOpen(false);
        reset();
      },
      onError: (err) => {
        toast.error(err.response.data.message);
      },
    });
  };

  const handleEditClick = (offer) => {
    editReset();
    setSelectedOffer(offer);
    const catgid = CategoryList?.category?.find(
      (cat) => cat.catgName === offer.categoryName
    );
    console.log(catgid);
    setEditValue("categoryId", catgid._id);
    setEditValue("discountType", offer.discountType);
    setEditValue("value", offer.value);
    setEditValue("startDate", offer.startDate?.split("T")[0]);
    setEditValue("endDate", offer.endDate?.split("T")[0]);
    setEditOpen(true);
  };
  const onEditSubmit = (data) => {
    console.log("xxx");
    UpdateOffers(
      { offerId: selectedOffer.id, data },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          editReset();
          setEditOpen(false);
        },
        onError: (err) => {
          toast.error(err.response.data.message);
        },
      }
    );
  };
  const HandleVisibility = async (offerId) => {
    console.log(offerId)
    const wait = await confirm({
      message: "Are you sure you want to make changes",
    });
    if (wait) {
      OfferVisibility(offerId, {
        onSuccess: (data) => {
          toast.success(data.message);
        },
        onError: (err) => {
          toast.error(err.response.data.message);
        },
      });
    }
  };

  return (
    <div className="p-6 w-full">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Category Offers</h1>
        <button
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => setOpen(true)}
        >
          Add Offer
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Add Category Offer</h2>

            <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
              <div>
                <label className="text-sm font-medium">select category</label>
                <select
                  {...register("categoryId", { required: "select category" })}
                  className="border border-black outline-none p-3 w-full rounded transition-all bg-white"
                >
                  <option value="">Select Category</option>
                  {CategoryList?.category?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.catgName}
                    </option>
                  ))}
                </select>
                {errors.categoryId && (
                  <p className="text-red-600 text-sm">
                    {errors?.categoryId?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <select
                  className="w-full border p-2 rounded mt-1"
                  {...register("discountType", {
                    required: "Please select a discount type",
                  })}
                >
                  <option value="" disabled>
                    -- Select discount type --
                  </option>
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
                {errors.discountType && (
                  <p className="text-red-500 text-xs">
                    {errors.discountType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Value</label>
                <input
                  type="number"
                  placeholder="Enter discount value"
                  className="w-full border p-2 rounded mt-1"
                  {...register("value", {
                    required: "Value is required",
                    min: { value: 1, message: "Value must be at least 1" },
                  })}
                />
                {errors.value && (
                  <p className="text-red-500 text-xs">{errors.value.message}</p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded mt-1"
                  {...register("startDate", {
                    required: "Start date is required",
                  })}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs">
                    {errors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded mt-1"
                  {...register("endDate", {
                    required: "End date is required",
                  })}
                />
                {errors.endDate && (
                  <p className="text-red-500 text-xs">
                    {errors.endDate.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => {
                    reset();
                    setOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Save Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Edit Category Offer</h2>

            <form
              className="space-y-4"
              onSubmit={handleEditSubmit(onEditSubmit)}
            >
              <div>
                <label className="text-sm font-medium">select category</label>
                <select
                  {...editRegister("categoryId", {
                    required: "select category",
                  })}
                  className="border border-black outline-none p-3 w-full rounded transition-all bg-white"
                >
                  <option value="" disabled>
                    Select Category
                  </option>
                  {CategoryList?.category?.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.catgName}
                    </option>
                  ))}
                </select>
                {editErrors.categoryId && (
                  <p className="text-red-600 text-sm">
                    {editErrors?.categoryId?.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Discount Type</label>
                <select
                  className="w-full border p-2 rounded mt-1"
                  {...editRegister("discountType", {
                    required: "Please select a discount type",
                  })}
                >
                  <option value="" disabled>
                    -- Select discount type --
                  </option>
                  <option value="percent">Percent (%)</option>
                  <option value="flat">Flat (₹)</option>
                </select>
                {editErrors.discountType && (
                  <p className="text-red-500 text-xs">
                    {editErrors.discountType.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Value</label>
                <input
                  type="number"
                  placeholder="Enter discount value"
                  className="w-full border p-2 rounded mt-1"
                  {...editRegister("value", {
                    required: "Value is required",
                    min: { value: 1, message: "Value must be at least 1" },
                  })}
                />
                {editErrors.value && (
                  <p className="text-red-500 text-xs">
                    {editErrors.value.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">Start Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded mt-1"
                  {...editRegister("startDate", {
                    required: "Start date is required",
                  })}
                />
                {editErrors.startDate && (
                  <p className="text-red-500 text-xs">
                    {editErrors.startDate.message}
                  </p>
                )}
              </div>

              <div>
                <label className="text-sm font-medium">End Date</label>
                <input
                  type="date"
                  className="w-full border p-2 rounded mt-1"
                  {...editRegister("endDate", {
                    required: "End date is required",
                  })}
                />
                {editErrors.endDate && (
                  <p className="text-red-500 text-xs">
                    {editErrors.endDate.message}
                  </p>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
                  onClick={() => {
                    editReset();
                    setEditOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Update Offer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="mt-8 bg-white shadow-md rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-800">
            Available Offers
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Category
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Discount
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Date Range
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {availableOffers?.offers?.length > 0 ? (
                availableOffers.offers.map((offer) => (
                  <tr
                    key={offer.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {offer.categoryName}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                      {offer.discountType === "percent"
                        ? `${offer.value}%`
                        : `₹${offer.value}`}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="space-y-1">
                        <div>
                          From: {new Date(offer.startDate).toLocaleDateString()}
                        </div>
                        <div>
                          To: {new Date(offer.endDate).toLocaleDateString()}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {offer.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditClick(offer)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="px-3 py-1.5 bg-yellow-500 text-white text-xs font-medium rounded hover:bg-yellow-600 transition-colors"
                          onClick={() => HandleVisibility(offer.id)}
                        >
                          {offer?.isActive ? (
                            <Eye className="w-4 h-4" />
                          ) : (
                            <EyeOff className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-12 text-center text-gray-500"
                  >
                    <div className="flex flex-col items-center justify-center">
                      <svg
                        className="w-12 h-12 text-gray-300 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                        />
                      </svg>
                      <p className="text-sm font-medium">
                        No offers added yet.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Click "Add Offer" to create your first offer.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
