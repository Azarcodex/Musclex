import React, { useState } from "react";
import {
  Tag,
  Boxes,
  Calendar,
  Hash,
  Pencil,
  Trash2,
  Eye,
  X,
} from "lucide-react";
import { useGetBrands } from "../../hooks/users/useGetBrands";
import { useDeleteBrand } from "../../hooks/vendor/useDeleteBrand";
import { confirm } from "../../components/utils/Confirmation.jsx";
import { useForm } from "react-hook-form";
import { useEditBrand } from "../../hooks/vendor/useEditBrand.js";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const BrandList = () => {
  const { data } = useGetBrands();
  const { mutate: Remove } = useDeleteBrand();
  const { mutate: Update } = useEditBrand();
  const [brands, setBrands] = useState(null);
  const { register, handleSubmit, reset } = useForm();
  console.log(data);
  const HandleDelete = async (id) => {
    const result = await confirm({
      message: "Are you sure You want to delete these",
    });
    if (result) {
      Remove({ id: id });
    }
  };
  //edit feature
  const querClient = useQueryClient();
  const HandleEdit = (brands) => {
    setBrands(brands);
    console.log(brands);
    reset({ brand_name: brands.brand_name });
  };
  const onSubmit = (data) => {
    Update(
      { id: brands._id, data: { brand_name: data.brand_name } },
      {
        onSuccess: (data) => {
          setBrands(null);
          toast.success(`${data.message}`);
          reset();
          querClient.invalidateQueries(["brands"]);
        },
        onError: (err) => {
          toast.error(err.message);
        },
      }
    );
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6">
          <h1 className="text-3xl font-bold text-white">Brand List</h1>
          <p className="text-purple-100 mt-1">Overview of all product brands</p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-6">
          <table className="w-full border-collapse">
            {/* <thead>
              <tr className="bg-purple-100 text-purple-800">
                <th className="py-3 px-4 font-semibold flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Index
                </th>
                <th className="py-3 px-4 font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Brand Name
                </th>
                {/* <th className="py-3 px-4 font-semibold flex items-center gap-2">
                  <Boxes className="w-4 h-4" /> No. of Products
                // </th> */}
                {/* // <th className="py-3 px-4 font-semibold flex items-center gap-2">
                //   <Calendar className="w-4 h-4" /> Created Date
                // </th> */}
                {/* <th className="py-3 px-4 font-semibold">Action</th> */}
              {/* </tr>
            </thead> */} 
            
            <tbody>
              {data?.map((brand, index) => (
                <tr
                  key={brand._id}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-semibold">
                    {brand.brand_name}
                  </td>
                  {/* <td className="py-3 px-4 text-gray-700">0</td> */}
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(brand.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td>
                    <Eye />
                  </td>
                  <td>
                    <Pencil
                      onClick={() => HandleEdit(brand)}
                      className="w-4 h-4 hover:text-violet-600 hover:border-b-2 hover:border-black"
                    />
                  </td>
                  <td>
                    <Trash2 onClick={() => HandleDelete(brand._id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {brands && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setEditItem(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold text-purple-600 mb-4">
              Edit Brand
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Category Name
                </label>
                <input
                  {...register("brand_name", {
                    required: "Pls enter brand name",
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setBrands(null)}
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 text-white hover:bg-purple-700"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandList;
