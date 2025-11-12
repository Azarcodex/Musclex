import React, { useState } from "react";
import {
  CheckCircle2,
  Image,
  Mail,
  PencilIcon,
  User,
  Verified,
} from "lucide-react";
import {
  useEditUsername,
  useGetUserdata,
} from "../../../hooks/users/useGetUserdata";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const { data } = useGetUserdata();
  const id = data?.user._id;
  const [edit, setEdit] = useState(false);
  const { mutate: updateName } = useEditUsername();
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  console.log(data);
  const onSubmit = (data) => {
    updateName(
      { id, name: data.name },
      {
        onSuccess: (data) => {
          queryClient.invalidateQueries(["userDetails"]);
          toast.success(`${data.message}`);
          reset();
          setEdit(false);
        },
      }
    );
  };
  return (
    <div className="p-5 h-full relative">
      <div className="max-w-xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-sm shadow-lg overflow-hidden">
          {/* Purple gradient header */}
          <div className="h-24 bg-gradient-to-r from-purple-200 to-indigo-100"></div>

          {/* Profile section */}
          <div className="px-6 pb-6">
            {/* Avatar */}
            <div className="relative -mt-12 mb-3">
              <div className="w-24 h-24 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                <span className="text-3xl font-bold text-white">
                  {data?.user?.name?.charAt(0)?.toUpperCase() || "U"}
                </span>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-xl font-bold text-gray-800 mb-4 flex gap-2 items-center">
              User Details
              {data?.user?.isVerified ? (
                <Verified className="text-green-600" />
              ) : (
                ""
              )}
            </h1>

            {/* User info cards */}
            <div className="space-y-3">
              {/* Name card */}
              <div className=" rounded-sm p-4 border border-purple-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-normal text-purple-600 uppercase  flex items-center gap-2 mb-1">
                      <User className="w-4 h-4" /> Name
                      <span className="float-right">
                        <PencilIcon
                          className="text-purple-600 cursor-pointer w-4 h-4"
                          onClick={() => {
                            setEdit(true);
                            reset({ name: data?.user?.name });
                          }}
                        />
                      </span>
                    </span>
                    <span className=" font-normal text-sm text-gray-800">
                      {data?.user?.name || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Email card */}
              <div className=" rounded-lg p-4 border border-purple-100 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-normal text-purple-600 uppercase  flex items-center gap-2 mb-1">
                      <Mail className="w-4 h-4" /> Email
                    </span>
                    <span className="text-sm font-normal text-gray-800">
                      {data?.user?.email || "Not provided"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {edit && (
        <>
          {/* 🔹 Background Blur Layer */}
          <div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
            onClick={() => setEdit(false)} // click outside to close
          ></div>

          {/* 🔹 Centered Form Modal */}
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
                 flex flex-col gap-4 p-6 border-2 border-purple-200 rounded-xl 
                 shadow-2xl bg-gradient-to-br from-white to-purple-50 w-80 
                 z-50 animate-fadeIn"
          >
            {/* Name */}
            <div>
              <label className="flex items-center gap-2 text-sm font-semibold mb-2 text-gray-700">
                <User className="w-4 h-4 text-purple-600" />
                Name
              </label>
              <input
                type="text"
                placeholder="Enter your name"
                {...register("name", { required: true })}
                className="border-2 border-purple-200 focus:border-purple-500 outline-none 
                     rounded-lg p-3 w-full transition-colors bg-white"
              />
              {errors.name && (
                <span className="text-red-500 text-xs mt-1 block">
                  Name is required
                </span>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 
                   hover:to-indigo-700 text-white font-bold py-3 rounded-lg 
                   transition-all shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              Save Changes
            </button>
          </form>
        </>
      )}
    </div>
  );
};

export default Profile;
