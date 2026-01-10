// components/user/AddressForm.jsx
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

const AddressForm = ({ initialData = null, onSubmit, onClose }) => {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: initialData || {
      fullName: "",
      phone: "",
      pincode: "",
      state: "",
      city: "",
      addressLine: "",
      landmark: "",
      isDefault: false,
    },
  });

  useEffect(() => {
    if (initialData) reset(initialData);
  }, [initialData, reset]);

  return (
    <div className="fixed inset-0 z-50 bg-white bg-opacity-50 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-2 right-3 text-gray-600 hover:text-gray-900 text-2xl font-bold"
        >
          &times;
        </button>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-4 text-sm text-gray-800"
        >
          {/* Full Name */}
          <div>
            <label className="block mb-1 font-medium">*Full Name</label>
            <input
              {...register("fullName", { required: "Full name is required" })}
              placeholder="Enter your name"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
            {errors.fullName && (
              <p className="text-red-500 text-xs mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Phone + Pincode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">*Phone</label>
              <input
                {...register("phone", { required: "Phone number is required" })}
                placeholder="Enter phone number"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {errors.phone && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">*Pincode</label>
              <input
                {...register("pincode", { required: "Pincode is required" })}
                placeholder="Enter pincode"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {errors.pincode && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.pincode.message}
                </p>
              )}
            </div>
          </div>

          {/* State + City */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block mb-1 font-medium">*State</label>
              <input
                {...register("state", { required: "Enter state" })}
                placeholder="Enter state"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {errors.state && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.state.message}
                </p>
              )}
            </div>

            <div>
              <label className="block mb-1 font-medium">*City</label>
              <input
                {...register("city", { required: "enter city" })}
                placeholder="Enter city"
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
              />
              {errors.city && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.city.message}
                </p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block mb-1 font-medium">*Full Address</label>
            <textarea
              {...register("addressLine", { required: "Address is required" })}
              placeholder="Enter your address"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none resize-none"
            />
            {errors.addressLine && (
              <p className="text-red-500 text-xs mt-1">
                {errors.addressLine.message}
              </p>
            )}
          </div>

          {/* Landmark */}
          <div>
            <label className="block mb-1 font-medium">
              Landmark (optional)
            </label>
            <input
              {...register("landmark")}
              placeholder="E.g. near temple or bus stop"
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-purple-500 outline-none"
            />
          </div>

          {/* Default Checkbox */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              {...register("isDefault")}
              className="w-4 h-4 accent-purple-600 cursor-pointer"
            />
            <label className="text-sm">Make this my default address</label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md shadow transition"
            >
              Save Address
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressForm;
