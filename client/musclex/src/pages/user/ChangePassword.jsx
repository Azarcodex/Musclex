import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useChangePassword } from "../../hooks/users/useGetUserdata";
import { useNavigate } from "react-router-dom";
import { Lock } from "lucide-react";

export default function ChangePassword() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { mutate, isPending } = useChangePassword();
  const navigate = useNavigate();

  const onSubmit = (data) => {
    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    mutate(
      { oldPassword: data.oldPassword, newPassword: data.newPassword },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          reset();
          navigate("/user/userdetails/profile");
        },
        onError: (err) => {
          toast.error(err.response.data.message);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div className="text-center space-y-2">
          <div className="flex justify-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <Lock className="text-purple-600" />
            </div>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Change Password
          </h2>
          <p className="text-sm text-gray-500">
            Choose a strong password you haven’t used before
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              {...register("oldPassword", { required: "enter old password" })}
              type="password"
              placeholder="Current password"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.oldPassword && (
              <p className="text-red-600 text-xs mt-1">
                {errors.oldPassword.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("newPassword", { required: "enter new password" })}
              type="password"
              placeholder="New password"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.newPassword && (
              <p className="text-red-600 text-xs mt-1">
                {errors.newPassword.message}
              </p>
            )}
          </div>

          <div>
            <input
              {...register("confirmPassword", {
                required: "enter password again to confirm",
              })}
              type="password"
              placeholder="Confirm new password"
              className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            {errors.confirmPassword && (
              <p className="text-red-600 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full bg-purple-600 text-white py-2 rounded-lg font-medium hover:bg-purple-700 transition disabled:opacity-60"
          >
            {isPending ? "Changing..." : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
