import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useResetPassword } from "../../hooks/users/useForgetPasswordcheck";

export default function ResetPassword() {
  const navigate = useNavigate();
  const email = localStorage.getItem("email");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();

  const { mutate, isPending } = useResetPassword();

  const onSubmit = (data) => {
    if (!email) {
      toast.error("Session expired. Please restart forgot password.");
      navigate("/user/forgot-password");
      return;
    }

    if (data.newPassword !== data.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    mutate(
      {
        email,
        newPassword: data.newPassword,
        confirmPassword: data.confirmPassword,
      },
      {
        onSuccess: (res) => {
          toast.success(res.message || "Password reset successful");
          reset();
          localStorage.removeItem("email");
          navigate("/user/login", { replace: true });
        },
        onError: (err) => {
          toast.error(err?.response?.data?.message || "Something went wrong");
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
            Reset Password
          </h2>
          <p className="text-sm text-gray-500">
            Enter a new password for your account
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <input
              type="password"
              placeholder="New password"
              {...register("newPassword", {
                required: "New password is required",
                minLength: {
                  value: 6,
                  message: "Minimum 6 characters",
                },
              })}
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
              type="password"
              placeholder="Confirm new password"
              {...register("confirmPassword", {
                required: "Confirm your password",
              })}
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
            {isPending ? "Resetting..." : "Reset Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
