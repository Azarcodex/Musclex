import React, { useState } from "react";
import {
  Tag,
  Boxes,
  Calendar,
  Hash,
  Pencil,
  Trash2,
  X,
  Eye,
} from "lucide-react";
import { usegetCategories } from "../../hooks/users/usegetCategories";
import { useEditCategory } from "../../hooks/vendor/useEditCategory";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { confirm } from "../../components/utils/Confirmation";
import { useDeleteCategory } from "../../hooks/vendor/useDeleteCategory";
// const categories = [
//   { id: 1, name: "Supplements", products: 12, createdAt: "2025-10-25" },
//   { id: 2, name: "Equipment", products: 8, createdAt: "2025-10-26" },
//   { id: 3, name: "Accessories", products: 15, createdAt: "2025-10-27" },
// ];

const CategoryList = () => {
  const { data } = usegetCategories();
  const [editItem, setEditItem] = useState(null);
  const queryClient = useQueryClient();
  const {
    register,
    reset,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { mutate } = useEditCategory();
  const { mutate: deletecategory } = useDeleteCategory();
  const onSubmit = (formdata) => {
    if (!editItem) return null;
    console.log(formdata.catgName);
    mutate(
      { id: editItem._id, data: { catgName: formdata.catgName } },
      {
        onSuccess: (data) => {
          setEditItem(null);
          toast.success(`${data.message}`);
          reset();
          queryClient.invalidateQueries(["category"]);
        },
        onError: (data) => {
          console.log(data);
          toast.error(`${data.message}`);
        },
      }
    );
  };
  const HandleEdit = (cat) => {
    console.log(cat);
    setEditItem(cat);
    console.log(cat.catgName);
    reset({ catgName: cat.catgName });
  };
  const HandleDelete = async (id) => {
    const wait = await confirm({ message: "Are you sure you want to delete" });
    if (wait) {
      deletecategory(
        { id: id },
        {
          onSuccess: (data) => {
            toast.message(`${data.message}`);
            queryClient.invalidateQueries(["category"]);
          },
        }
      );
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white p-8">
      <div className="max-w-5xl mx-auto bg-white rounded-3xl shadow-xl border border-purple-100 overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-500 p-6">
          <h1 className="text-3xl font-bold text-white">Category List</h1>
          <p className="text-purple-100 mt-1">
            Overview of all product categories
          </p>
        </div>

        {/* Table */}
        <div className="overflow-x-auto p-6">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-purple-100 text-purple-800 text-left">
                <th className="py-3 px-4 font-semibold flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Index
                </th>
                <th className="py-3 px-4 font-semibold flex items-center gap-2">
                  <Tag className="w-4 h-4" /> Category Name
                </th>
                {/* <th className="py-3 px-4 font-semibold flex items-center gap-2">
                  <Boxes className="w-4 h-4" /> No. of Products
                </th> */}
                <th className="py-3 px-4 font-semibold flex items-center gap-2">
                  <Calendar className="w-4 h-4" /> Created Date
                </th>
              </tr>
            </thead>
            <tbody>
              {data?.map((cat, index) => (
                <tr
                  key={cat.id}
                  className="border-b border-gray-100 hover:bg-purple-50 transition-colors"
                >
                  <td className="py-3 px-4 text-gray-700 font-medium">
                    {index + 1}
                  </td>
                  <td className="py-3 px-4 text-gray-800 font-semibold">
                    {cat.catgName}
                  </td>
                  {/* <td className="py-3 px-4 text-gray-700">0</td> */}
                  <td className="py-3 px-4 text-gray-600">
                    {new Date(cat.createdAt).toLocaleDateString("en-IN", {
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
                      className="w-4 h-4 hover:text-violet-600 hover:border-b-2 hover:border-black"
                      onClick={() => HandleEdit(cat)}
                    />
                  </td>
                  <td>
                    <Trash2 onClick={() => HandleDelete(cat._id)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {editItem && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-2xl w-[90%] max-w-md p-6 relative">
            <button
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700"
              onClick={() => setEditItem(null)}
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-2xl font-semibold text-purple-600 mb-4">
              Edit Category
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2">
                  Category Name
                </label>
                <input
                  {...register("catgName", {
                    required: "Pls enter category name",
                  })}
                  className="w-full border border-gray-300 rounded-lg p-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 mt-6">
                <button
                  type="button"
                  onClick={() => setEditItem(null)}
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

export default CategoryList;
