import React, { useState } from "react";
import {
  Mail,
  User,
  Verified,
  FileQuestionMark,
  Image,
  PencilIcon,
  X,
  Trash2,
} from "lucide-react";
import {
  useEditUsername,
  useGetUserdata,
  useRemoveProfileImage,
  useUploadImage,
} from "../../../hooks/users/useGetUserdata";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import CropperModal from "../../../components/crop/CropperModel";

const Profile = () => {
  const navigate = useNavigate();
  const { data } = useGetUserdata();
  const id = data?.user?._id;

  const [edit, setEdit] = useState(false);
  const [cropModal, setCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { mutate: updateName } = useEditUsername();
  const { mutate: uploadImage } = useUploadImage();
  const { mutate: removeImage, isPending: isLoading } = useRemoveProfileImage();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedImage(URL.createObjectURL(file));
    setCropModal(true);
  };

  const handleCropDone = (blob) => {
    const formData = new FormData();
    formData.append("avatar", blob);
    uploadImage(formData, {
      onSuccess: () => {
        toast.success("Profile image updated");
        setCropModal(false);
        queryClient.invalidateQueries(["userDetails"]);
      },
      onError: () => toast.error("Image upload failed"),
    });
  };

  const onSubmit = (data) => {
    updateName(
      { id, name: data.name },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(["userDetails"]);
          toast.success(data.message);
          reset();
          setEdit(false);
        },
      }
    );
  };

  const handleRemove = () => {
    removeImage(undefined, {
      onSuccess: (res) => toast.success(res.message),
      onError: (err) =>
        toast.error(err.response?.data?.message || "Failed to remove image"),
    });
  };

  return (
    <div className="p-5 h-full relative">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Header Banner */}
          <div className="h-28 bg-gradient-to-r from-indigo-600 to-purple-500"></div>

          <div className="px-6 pb-8">
            {/* Avatar Section */}
            <div className="relative -mt-16 mb-4">
              <div className="w-32 h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 mx-auto">
                {data?.user?.profileImage ? (
                  <div className="relative w-32 h-32 group">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${
                        data.user.profileImage
                      }`}
                      className="w-full h-full object-cover rounded-full border shadow-sm"
                      alt="Profile"
                    />

                    {/* Delete Button - shows on hover */}
                    <button
                      onClick={handleRemove}
                      disabled={isLoading}
                      className="
      absolute bottom-1 right-[50px]
      bg-red-600 text-white rounded-full p-2 shadow-md
      opacity-0 group-hover:opacity-100 transition-opacity
      hover:bg-red-700
    "
                      title="Remove Profile Image"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-500 to-indigo-600">
                    <span className="text-5xl font-extrabold text-white">
                      {data?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              {/* Image Upload Button */}
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-[calc(50%-44px)] bg-white text-indigo-600 p-2 rounded-full cursor-pointer shadow-lg hover:bg-indigo-50 transition-colors border border-gray-200"
              >
                <PencilIcon className="w-4 h-4" />
                <input
                  id="avatar-upload"
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            {/* Title and Change Password Link */}
            <div className="flex items-center justify-between mt-4 border-b pb-4 mb-6">
              <h1 className="text-2xl font-bold text-gray-800 flex gap-2 items-center">
                My Profile Details
                {data?.user?.isVerified && (
                  <Verified className="text-blue-500 w-5 h-5" />
                )}
              </h1>

              <button
                className="flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
                onClick={() => navigate("/user/changePassword")}
              >
                Change Password <FileQuestionMark className="w-4 h-4" />
              </button>
            </div>

            {/* Profile Fields */}
            <div className="space-y-4">
              {/* Name Field */}
              <div className="bg-white p-5 border border-purple-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs font-semibold text-purple-600 uppercase flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" />
                      Name
                    </span>
                    <span className="font-semibold text-lg text-gray-900">
                      {data?.user?.name || "Not provided"}
                    </span>
                  </div>
                  <button
                    className="text-indigo-500 hover:text-indigo-700 p-2 rounded-full hover:bg-indigo-50 transition-colors"
                    onClick={() => {
                      setEdit(true);
                      reset({ name: data?.user?.name });
                    }}
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Email Field */}
              <div className="bg-white p-5 border border-purple-200 rounded-xl shadow-sm hover:shadow-lg transition-shadow">
                <span className="text-xs font-semibold text-purple-600 uppercase flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" /> Email Address
                </span>
                <span className="text-lg font-semibold text-gray-900">
                  {data?.user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ---------- EDIT NAME MODAL ---------- */}
      {edit && (
        <>
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setEdit(false)}
          ></div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            flex flex-col gap-5 p-8 border-2 border-purple-300 rounded-xl
            shadow-2xl bg-white w-full max-w-sm
            z-50 animate-in fade-in zoom-in duration-300"
          >
            <div className="flex justify-between items-center pb-2 border-b">
              <h3 className="text-xl font-bold text-gray-800">Edit Name</h3>
              <button
                type="button"
                onClick={() => setEdit(false)}
                className="text-gray-400 hover:text-gray-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                <User className="w-4 h-4 text-purple-600" />
                New Name
              </label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="border-2 border-indigo-300 focus:border-indigo-500 rounded-lg p-3 w-full outline-none transition-colors focus:ring-1 focus:ring-indigo-500"
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1 block">
                  Name is required
                </span>
              )}
            </div>

            <button
              type="submit"
              className="bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/50"
            >
              Save Changes
            </button>
          </form>
        </>
      )}

      {cropModal && (
        <CropperModal
          image={selectedImage}
          onCropDone={handleCropDone}
          onClose={() => setCropModal(false)}
        />
      )}
    </div>
  );
};

export default Profile;
