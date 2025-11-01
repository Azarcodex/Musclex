import React from "react";
import { useForm } from "react-hook-form";
import { useAddProduct } from "../../hooks/vendor/useAddProduct";
import { useGetBrands } from "../../hooks/users/useGetBrands";
import { usegetCategories } from "../../hooks/users/usegetCategories";

const ProductForm = () => {
  const { register, handleSubmit, reset } = useForm();
  const { mutate, isPending } = useAddProduct();
  const { data: brands, isLoading: brandLoading } = useGetBrands();
  const { data: categories, isLoading: catLoading } = usegetCategories();

  const onSubmit = (data) => {
    console.log(data);
    mutate(data);
    reset();
  };

  if (brandLoading || catLoading) return <p>Loading form...</p>;

  return (
    <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-lg border border-purple-100 p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold text-center text-purple-700 mb-6">
        Add New Product
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Product Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Product Name
          </label>
          <input
            {...register("name", { required: true })}
            placeholder="Enter product name"
            className="border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none p-3 w-full rounded-xl transition-all"
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            {...register("description")}
            placeholder="Write a short description..."
            rows={3}
            className="border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none p-3 w-full rounded-xl transition-all resize-none"
          />
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Category
          </label>
          <select
            {...register("catgid", { required: true })}
            className="border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none p-3 w-full rounded-xl transition-all bg-white"
          >
            <option value="">Select Category</option>
            {categories?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.catgName}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Brand</label>
          <select
            {...register("brandID", { required: true })}
            className="border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none p-3 w-full rounded-xl transition-all bg-white"
          >
            <option value="">Select Brand</option>
            {brands?.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.brand_name}
              </option>
            ))}
          </select>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          {isPending ? "Adding..." : "Add Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
