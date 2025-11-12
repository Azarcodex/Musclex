import React, { useState } from "react";
import { usegetCategories } from "../../hooks/users/usegetCategories";
import DataTable from "../../components/utils/Table";
import {
  Eye,
  EyeClosed,
  EyeIcon,
  EyeOff,
  EyeOffIcon,
  LucideEye,
  LucideEyeClosed,
  Pencil,
  PlusSquare,
  Trash,
  X,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { useAddCategory } from "../../hooks/vendor/useAddCategory";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useEditCategory } from "../../hooks/vendor/useEditCategory";
import { confirm } from "../../components/utils/Confirmation";
import { usecategoryvisibility } from "../../hooks/admin/usecategoryvisibility";
// import { categoryController } from "../../services/admin/adminService";
import { usegetAllCategory } from "../../hooks/admin/useGetAllCategory";
import { useDeleteCategory } from "../../hooks/vendor/useDeleteCategory";

const Category = () => {
  const { data } = usegetAllCategory();
  console.log(data);
  const [modelOpen, setModelOpen] = useState(false);
  const [editItem, setEditItem] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm();
  const { mutate } = useAddCategory();
  const { mutate: Editing } = useEditCategory();
  const { mutate: visibility } = usecategoryvisibility();
  const { mutate: deleteCategory } = useDeleteCategory();
  const querClient = useQueryClient();
  const onSubmit = (data) => {
    mutate(data, {
      onSuccess: (data) => {
        setModelOpen(false);
        toast.success(`${data.message}`);
        querClient.invalidateQueries(["category"]);
        reset();
      },
      onError: (err) => {
        console.log(err);
        toast.error(`${err.response.data.message}`);
      },
    });
  };
  const HandleEdit = (row) => {
    setModelOpen(true);
    setEditItem(row);
    // setValue("catgName" + row.catgName);
    reset({ catgName: row.catgName });
    // reset({ catgName: row.catgName });
  };
  const HandleDelete = async (id) => {
    const wait = await confirm({ message: "Are you sure you want to delete" });
    if (wait) {
      deleteCategory(
        { id: id },
        {
          onSuccess: (data) => {
            toast.message(`${data.message}`);
            querClient.invalidateQueries(["category"]);
          },
          onError: (err) => {
            toast.error(`${err.response.data.message}`);
          },
        }
      );
    }
  };
  const HandleVisibility = async (id) => {
    const wait = await confirm({ message: "Do you want to make changes" });
    if (wait) {
      visibility(
        { id: id },
        {
          onSuccess: (data) => {
            toast.message(`${data.message}`);
            querClient.invalidateQueries(["category"]);
          },
          onError: (err) => {
            toast.error(`${err.response.data.message}`);
          },
        }
      );
    }
  };
  const onSubmitEdit = (formData) => {
    Editing(
      { id: editItem._id, data: { catgName: formData.catgName } },
      {
        onSuccess: (values) => {
          setEditItem("");
          setModelOpen(false);
          toast.success(`${values.message}`);
          querClient.invalidateQueries(["category"]);
          reset();
        },
        onError: (err) => {
          toast.error(`${err.response.data.message}`);
        },
      }
    );
  };
  const columns = [
    { header: "#", cell: (info) => info.row.index + 1 },
    { header: "categoryName", accessorKey: "catgName" },
    { header: "TotalProducts", accessorKey: "totalCount" },
    {
      header: "Date",
      cell: (info) => {
        const createdAt = info.row.original?.createdAt;
        if (!createdAt) return "N/A";

        const date = new Date(createdAt);
        if (isNaN(date)) return "Invalid Date";

        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
    {
      header: "Actions",
      cell: (info) => {
        const row = info.row.original;
        console.log(row)
        return (
          <div className="flex items-center justify-evenly">
            <button
              onClick={(e) => {
                e.stopPropagation();
                HandleEdit(row);
              }}
            >
              <Pencil className="w-4 h-4 text-purple-900" />
            </button>
            <button onClick={() => HandleVisibility(row._id)}>
              {row.isActive ? (
                <EyeIcon className="w-4 h-4 text-green-500" />
              ) : (
                <EyeOffIcon className="w-4 h-4 text-red-800" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                HandleDelete(row._id);
              }}
            >
              <Trash className="w-4 h-4" />
            </button>
          </div>
        );
      },
    },
  ];
  return (
    <div>
      <div className={`relative h-full ${modelOpen ? "blur-3xl" : ""}`}>
        <div className="place-self-end">
          <button
            onClick={() => {
              reset({ catgName: "" });
              setEditItem("");
              setModelOpen(true);
            }}
            className="font-semibold rounded-md flex items-center border-2 px-1 py-2 bg-purple-600 text-white border-purple-600 hover:bg-purple-400"
          >
            add category
            <PlusSquare className="text-white w-8 h-8" />
          </button>
        </div>
        <DataTable columns={columns} data={data?.category} />
      </div>
      {modelOpen && (
        <div className="p-10 rounded-md text-white absolute bg-purple-600 max-w-7xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <h2 className="text-center text-sm font-bold uppercase">
            {editItem ? "Edit category" : "add category"}
          </h2>
          <span className="float-right">
            <X
              onClick={() => {
                setModelOpen(!modelOpen);
                reset();
                setEditItem(null);
              }}
            />
          </span>
          <label className="block text-sm font-semibold text-white mb-2">
            Category Name <span className="text-red-500">*</span>
          </label>
          <input
            {...register("catgName", {
              //   minLength: {
              //     value: 2,
              //     message: "Category name must be at least 2 characters",
              //   },
              //   maxLength: {
              //     value: 50,
              //     message: "Category name must not exceed 50 characters",
              //   },
            })}
            type="text"
            autoComplete="off"
            placeholder="enter category name"
            className={`w-full border rounded-lg px-4 py-2 text-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all ${
              errors.name ? "border-purple-500" : "border-gray-300"
            }`}
          />
          {/* {errors.catgName&& (
            <p className="text-red-500 text-sm mt-2">{errors.catgName.message}</p>
          )} */}
          <div className="flex justify-center">
            {!editItem ? (
              <button
                type="button"
                onClick={handleSubmit(onSubmit)}
                className="px-2 text-sm py-1.5 mx-auto  mt-3 bg-purple-600 hover:bg-purple-50 border border-white hover:text-black text-white rounded-lg font-semibold transition-colors shadow-sm"
              >
                Add Category
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit(onSubmitEdit)}
                className="px-2 text-sm py-1.5 mx-auto  mt-3 bg-purple-600 hover:bg-purple-50 border border-white hover:text-black text-white rounded-lg font-semibold transition-colors shadow-sm"
              >
                save changes
              </button>
            )}
          </div>
          <p className="text-sm text-white-500 mt-2">
            Enter a unique category name for your products
          </p>
        </div>
      )}
    </div>
  );
};

export default Category;
