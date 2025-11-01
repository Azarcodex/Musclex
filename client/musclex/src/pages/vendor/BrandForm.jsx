import React from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, FolderPlus } from "lucide-react";
import { useAddBrands } from "../../hooks/vendor/useAddBrands";
import { toast } from "sonner";

const AddBrandForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    defaultValues: {
      brand_name: "",
    },
  });
  const { mutate } = useAddBrands();

  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (data) => {
        toast.success(`${data.message}`);
        reset();
      },
      onError: () => {
        toast.error("Invalid occurred");
      },
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Brands</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Add New Brand</h1>
          <p className="text-gray-600 mt-1">Create a new product brand</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="space-y-6">
            {/* Brand Icon */}
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center">
                <FolderPlus className="w-10 h-10 text-purple-600" />
              </div>
            </div>

            {/* Brand Name */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Brand Name <span className="text-red-500">*</span>
              </label>
              <input
                {...register("brand_name", {
                  required: "Brand name is required",
                  minLength: {
                    value: 2,
                    message: "Brand name must be at least 2 characters",
                  },
                  maxLength: {
                    value: 50,
                    message: "Brand name must not exceed 50 characters",
                  },
                })}
                type="text"
                placeholder="brand name"
                className={`w-full border rounded-lg px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name && (
                <p className="text-red-500 text-sm mt-2">
                  {errors.name.message}
                </p>
              )}
              <p className="text-sm text-gray-500 mt-2">
                Enter a unique brand name for your products
              </p>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => reset()}
              className="px-8 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleSubmit(onSubmit)}
              className="px-8 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors shadow-sm"
            >
              Add Brand
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBrandForm;
