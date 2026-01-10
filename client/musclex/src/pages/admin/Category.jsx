import React, { useState } from "react";
import { Plus, Pencil, Trash2, Eye, EyeOff, X } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { confirm } from "../../components/utils/Confirmation";
import { usegetAllCategory } from "../../hooks/admin/useGetAllCategory";
import { useAddCategory } from "../../hooks/vendor/useAddCategory";
import { useEditCategory } from "../../hooks/vendor/useEditCategory";
import { useDeleteCategory } from "../../hooks/vendor/useDeleteCategory";
import { usecategoryvisibility } from "../../hooks/admin/usecategoryvisibility";

const Category = () => {
  const { data } = usegetAllCategory();
  const categories = data?.category || [];

  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);

  const { register, handleSubmit, reset } = useForm();
  const queryClient = useQueryClient();

  const { mutate: addCategory } = useAddCategory();
  const { mutate: editCategory } = useEditCategory();
  const { mutate: deleteCategory } = useDeleteCategory();
  const { mutate: toggleVisibility } = usecategoryvisibility();

  // ---------- HANDLERS ----------

  const openAddModal = () => {
    reset({ catgName: "" });
    setEditItem(null);
    setModalOpen(true);
  };

  const openEditModal = (category) => {
    reset({ catgName: category.catgName });
    setEditItem(category);
    setModalOpen(true);
  };

  const closeModal = () => {
    reset();
    setEditItem(null);
    setModalOpen(false);
  };

  const handleAdd = (formData) => {
    addCategory(formData, {
      onSuccess: (res) => {
        toast.success(res.message);
        queryClient.invalidateQueries(["category"]);
        closeModal();
      },
      onError: (err) => toast.error(err.response?.data?.message || "Error"),
    });
  };

  const handleEdit = (formData) => {
    editCategory(
      { id: editItem._id, data: formData },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          queryClient.invalidateQueries(["category"]);
          closeModal();
        },
        onError: (err) => toast.error(err.response?.data?.message || "Error"),
      }
    );
  };

  const handleDelete = async (id) => {
    const ok = await confirm({ message: "Delete this category?" });
    if (!ok) return;

    deleteCategory(
      { id },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          queryClient.invalidateQueries(["category"]);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Error"),
      }
    );
  };

  const handleVisibility = async (id) => {
    const ok = await confirm({ message: "Change category visibility?" });
    if (!ok) return;

    toggleVisibility(
      { id },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          queryClient.invalidateQueries(["category"]);
        },
        onError: (err) => toast.error(err.response?.data?.message || "Error"),
      }
    );
  };

  // ---------- JSX ----------

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Categories</h1>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
        >
          <Plus size={18} /> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">#</th>
              <th className="p-3 text-left">Category</th>
              <th className="p-3 text-left">Products</th>
              <th className="p-3 text-left">Created</th>
              <th className="p-3 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan="5" className="p-6 text-center text-gray-500">
                  No categories found
                </td>
              </tr>
            ) : (
              categories.map((cat, i) => (
                <tr key={cat._id} className="border-t hover:bg-gray-50">
                  <td className="p-3">{i + 1}</td>
                  <td className="p-3 font-medium">{cat.catgName}</td>
                  <td className="p-3">{cat.totalCount || 0}</td>
                  <td className="p-3">
                    {new Date(cat.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-3 flex justify-center gap-3">
                    <button onClick={() => openEditModal(cat)}>
                      <Pencil size={16} className="text-purple-600" />
                    </button>
                    <button onClick={() => handleVisibility(cat._id)}>
                      {cat.isActive ? (
                        <Eye size={16} className="text-green-600" />
                      ) : (
                        <EyeOff size={16} className="text-red-600" />
                      )}
                    </button>
                    <button onClick={() => handleDelete(cat._id)}>
                      <Trash2 size={16} className="text-red-600" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-md rounded-lg p-6 relative">
            <button onClick={closeModal} className="absolute right-3 top-3">
              <X />
            </button>

            <h2 className="text-lg font-bold mb-4">
              {editItem ? "Edit Category" : "Add Category"}
            </h2>

            <form
              onSubmit={handleSubmit(editItem ? handleEdit : handleAdd)}
              className="space-y-4"
            >
              <input
                {...register("catgName", { required: true })}
                placeholder="Category name"
                className="w-full border rounded px-3 py-2"
              />

              <button
                type="submit"
                className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700"
              >
                {editItem ? "Save Changes" : "Add Category"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Category;
