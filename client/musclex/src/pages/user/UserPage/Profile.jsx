import React, { useState } from "react";
import {
  Mail,
  User,
  Verified,
  FileQuestionMark,
  Image,
  PencilIcon,
} from "lucide-react";
import {
  useEditUsername,
  useGetUserdata,
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
  console.log(data);
  const id = data?.user?._id;

  const [edit, setEdit] = useState(false);
  const [cropModal, setCropModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);

  const { mutate: updateName } = useEditUsername();
  const { mutate: uploadImage } = useUploadImage();
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

  //cropping
  const handleCropDone = (blob) => {
    const formData = new FormData();
    // const file = new File([blob], "avatar.png", { type: "image/png" });
    formData.append("avatar", blob);
    console.log(formData);
    uploadImage(formData, {
      onSuccess: () => {
        toast.success("Profile image updated");
        setCropModal(false);
        queryClient.invalidateQueries(["userDetails"]);
      },
      onError: () => toast.error("Image upload failed"),
    });
  };

  //name edit
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

  return (
    <div className="p-5 h-full relative">
      <div className="max-w-xl mx-auto">
        <div className="bg-white rounded-sm shadow-lg overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-purple-200 to-indigo-100"></div>

          <div className="px-6 pb-6">
            <div className="relative -mt-12 mb-3">
              <div className="w-24 h-24 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                {data?.user?.profileImage ? (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${
                      data.user.profileImage
                    }`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-purple-400 to-indigo-500">
                    <span className="text-3xl font-bold text-white">
                      {data?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                    </span>
                  </div>
                )}
              </div>

              <label className="absolute bottom-1 right-1 bg-purple-600 text-white p-1 rounded-full cursor-pointer">
                <Image className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </label>
            </div>

            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-gray-800 mb-4 flex gap-2 items-center">
                User Details
                {data?.user?.isVerified && (
                  <Verified className="text-green-600" />
                )}
              </h1>

              <h4
                className="flex items-center gap-1 text-sm text-purple-600 font-semibold cursor-pointer"
                onClick={() => navigate("/user/changePassword")}
              >
                change password <FileQuestionMark className="w-3 h-3" />
              </h4>
            </div>

            <div className="space-y-3">
              <div className="rounded-sm p-4 border border-purple-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-normal text-purple-600 uppercase flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" />
                      Name
                      <PencilIcon
                        className="text-purple-600 cursor-pointer w-4 h-4"
                        onClick={() => {
                          setEdit(true);
                          reset({ name: data?.user?.name });
                        }}
                      />
                    </span>
                    <span className="font-normal text-sm text-gray-800">
                      {data?.user?.name || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="rounded-sm p-4 border border-purple-100 hover:shadow-md transition-shadow">
                <span className="text-[10px] font-normal text-purple-600 uppercase flex items-center gap-2 mb-1">
                  <Mail className="w-4 h-4" /> Email
                </span>
                <span className="text-sm font-normal text-gray-800">
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setEdit(false)}
          ></div>

          <form
            onSubmit={handleSubmit(onSubmit)}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
            flex flex-col gap-4 p-6 border-2 border-purple-200 rounded-xl
            shadow-2xl bg-gradient-to-br from-white to-purple-50 w-80
            z-50"
          >
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                <User className="w-4 h-4 text-purple-600" />
                Name
              </label>
              <input
                type="text"
                {...register("name", { required: true })}
                className="border-2 border-purple-200 rounded-lg p-3 w-full outline-none"
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1 block">
                  Name is required
                </span>
              )}
            </div>

            <button
              type="submit"
              className="bg-purple-600 text-white py-3 rounded-lg font-bold hover:bg-purple-700"
            >
              Save Changes
            </button>
          </form>
        </>
      )}

      {/* ---------- CROP MODAL ---------- */}
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
