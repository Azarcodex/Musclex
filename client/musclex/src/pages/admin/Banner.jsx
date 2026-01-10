import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { X, Edit, Trash2, Plus, Upload } from "lucide-react";
import {
  useAddBanner,
  useGetBanners,
  useUpdateBanners,
} from "../../hooks/admin/useBannerController";
import { toast } from "sonner";

export default function BannerDashboard() {
  const URL = import.meta.env.VITE_API_URL;
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const { mutate: AddBanner } = useAddBanner();
  const { mutate: UpdateBanner } = useUpdateBanners();
  const { data } = useGetBanners();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const openModal = (banner = null) => {
    setEditingBanner(banner);
    setImagePreview(banner?.image ? `${URL}/uploads/${banner.image}` : null);
    setSelectedFile(null);
    if (banner) {
      reset({
        smallHeading: banner.smallHeading,
        heading: banner.heading,
        description: banner.description,
        isActive: banner.isActive,
      });
    } else {
      reset({
        smallHeading: "",
        heading: "",
        description: "",
        isActive: true,
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingBanner(null);
    setImagePreview(null);
    setSelectedFile(null);
    reset();
  };

  const onSubmit = async (data) => {
    console.log(data);
    const formData = new FormData();
    formData.append("smallHeading", data.smallHeading);
    formData.append("heading", data.heading);
    formData.append("description", data.description);
    formData.append("isActive", data.isActive ? "true" : "false");
    if (selectedFile) {
      formData.append("image", selectedFile);
    }
    if (editingBanner) {
      UpdateBanner(
        { id: editingBanner._id, payload: formData },
        {
          onSuccess: () => {
            toast.success("Banner updated");
            setIsModalOpen(false);
            reset();
          },
          onError: (err) => {
            toast.error(err.response?.data?.message || "error occurred");
          },
        }
      );
    } else {
      AddBanner(formData, {
        onSuccess: () => {
          toast.success("Banner added");
          setIsModalOpen(false);
          reset();
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "error occurred");
        },
      });
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Banner Management
          </h1>
          <button
            onClick={() => openModal()}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            <Plus size={20} />
            Add Banner
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((banner) => (
            <div
              key={banner._id}
              className="bg-white rounded-lg shadow-md overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={`${URL}/uploads/${banner.image}`}
                  alt={banner.heading}
                  className="w-full h-full object-cover"
                />
                <div
                  className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold ${
                    banner.isActive
                      ? "bg-green-500 text-white"
                      : "bg-gray-500 text-white"
                  }`}
                >
                  {banner.isActive ? "Active" : "Inactive"}
                </div>
              </div>

              <div className="p-4">
                <p className="text-sm text-gray-500 mb-1">
                  {banner.smallHeading}
                </p>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {banner.heading}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {banner.description}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => openModal(banner)}
                    className="flex-1 flex items-center justify-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-lg hover:bg-blue-100 transition"
                  >
                    <Edit size={16} />
                    Edit
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition">
                    <Trash2 size={16} />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBanner ? "Edit Banner" : "Add New Banner"}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Small Heading
                  </label>
                  <input
                    {...register("smallHeading", {
                      required: "Small heading is required",
                      maxLength: { value: 50, message: "Max 50 characters" },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., New Collection"
                  />
                  {errors.smallHeading && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.smallHeading.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Heading
                  </label>
                  <input
                    {...register("heading", {
                      required: "Heading is required",
                      maxLength: { value: 100, message: "Max 100 characters" },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="e.g., Summer Sale 2024"
                  />
                  {errors.heading && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.heading.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    {...register("description", {
                      required: "Description is required",
                      maxLength: { value: 500, message: "Max 500 characters" },
                    })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter banner description..."
                  />
                  {errors.description && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Banner Image
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-blue-500 transition">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      id="imageUpload"
                    />
                    <label
                      htmlFor="imageUpload"
                      className="flex flex-col items-center justify-center cursor-pointer"
                    >
                      {imagePreview ? (
                        <div className="relative w-full">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-full h-48 object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center rounded-lg opacity-0 hover:opacity-100 transition">
                            <Upload size={32} className="text-white" />
                          </div>
                        </div>
                      ) : (
                        <>
                          <Upload size={48} className="text-gray-400 mb-2" />
                          <p className="text-gray-600 text-sm">
                            Click to upload image
                          </p>
                          <p className="text-gray-400 text-xs mt-1">
                            PNG, JPG up to 5MB
                          </p>
                        </>
                      )}
                    </label>
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    {...register("isActive")}
                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    id="isActive"
                  />
                  <label
                    htmlFor="isActive"
                    className="ml-2 text-sm font-medium text-gray-700"
                  >
                    Set as Active
                  </label>
                </div>
              </div>

              <div className="flex gap-3 mt-6 pt-6 border-t">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  {editingBanner ? "Update Banner" : "Create Banner"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
