import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useAddProduct } from "../../hooks/vendor/useAddProduct";
import { useGetBrands } from "../../hooks/users/useGetBrands";
import { usegetCategories } from "../../hooks/users/usegetCategories";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEditProducts } from "../../hooks/vendor/useEditProducts";
import { toast } from "sonner";
import { useGetVendorCategory } from "../../hooks/vendor/useGetCategory";

const ProductForm = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { mutate, isPending } = useEditProducts();
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const location = useLocation();
  const productData = location.state?.product;
  console.log(productData);
  const { data: brands, isLoading: brandLoading } = useGetBrands();
  const { data: categories, isLoading: catLoading } = useGetVendorCategory();
  useEffect(() => {
    if (productData) {
      setValue("name", productData.name) || "";
      setValue("description", productData.description) || "";
      setValue("catgid", productData.catgid?._id) || "";
      setValue("brandID", productData.brandID?._id) || "";
    }
  }, [productData, setValue]);
  //submit
  const onSubmit = (data) => {
    mutate(
      { id: productId, data: data },
      {
        onSuccess: (data) => {
          console.log(data);
          toast.success(`${data.message}`);
          navigate("/vendor/dashboard/products/list");
        },
      }
    );
  };
  if (brandLoading) return <p>Loading...</p>;
  if (catLoading) return <p>Loading</p>;
  return (
    <div className="max-w-lg mx-auto bg-white/95 backdrop-blur-lg border border-purple-100 p-8 rounded-2xl shadow-xl">
      <h2 className="text-2xl font-semibold text-center text-purple-700 mb-6">
        Edit Product
      </h2>

      <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
        {/* Product Name */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Product Name
          </label>
          <input
            {...register("name", { required: "enter name" })}
            placeholder="Enter product name"
            className="border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none p-3 w-full rounded-xl transition-all"
          />
          {errors.name && <p>{errors.name.message}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Description
          </label>
          <textarea
            {...register("description", { required: "enter description" })}
            placeholder="Write a short description..."
            rows={3}
            className="border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none p-3 w-full rounded-xl transition-all resize-none"
          />
          {errors.description && <p>{errors.description.message}</p>}
        </div>

        {/* Category Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">
            Category
          </label>
          <select
            {...register("catgid", { required: "select valid category" })}
            className="border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none p-3 w-full rounded-xl transition-all bg-white"
          >
            <option value="">Select Category</option>
            {categories?.category?.map((cat) => (
              <option key={cat._id} value={cat._id}>
                {cat.catgName}
              </option>
            ))}
          </select>
          {}
        </div>

        {/* Brand Dropdown */}
        <div>
          <label className="block text-gray-700 font-medium mb-1">Brand</label>
          <select
            {...register("brandID", { required: "enter valid brand" })}
            className="border border-purple-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-300 outline-none p-3 w-full rounded-xl transition-all bg-white"
          >
            <option value="">Select Brand</option>
            {brands?.map((brand) => (
              <option key={brand._id} value={brand._id}>
                {brand.brand_name}
              </option>
            ))}
          </select>
          {errors.brandID && errors.brandID.message}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-semibold py-3 rounded-xl shadow-md hover:from-purple-700 hover:to-indigo-700 transition-all"
        >
          {isPending ? "Editing..." : "update Product"}
        </button>
      </form>
    </div>
  );
};

export default ProductForm;
