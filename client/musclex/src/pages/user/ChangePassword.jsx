import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useChangePassword } from "../../hooks/users/useGetUserdata";
import { useNavigate } from "react-router-dom";

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
    <div className=" p-5 space-y-5 flex items-center justify-center min-h-screen flex-col">
      <h2 className="text-xl font-semibold text-purple-700">Change Password</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-96">
        <input
          {...register("oldPassword", { required: "enter old password" })}
          type="password"
          placeholder="Enter current password"
          className="border p-2 w-full rounded"
        />
        {errors.oldPassword && (
          <p className="text-red-600 text-sm">{errors.oldPassword.message}</p>
        )}
        <input
          {...register("newPassword", { required: "enter new password" })}
          type="password"
          placeholder="Enter new password"
          className="border p-2 w-full rounded"
        />
        {errors.newPassword && (
          <p className="text-red-600 text-sm">{errors.newPassword.message}</p>
        )}
        <input
          {...register("confirmPassword", {
            required: "enter password again to confirm",
          })}
          type="password"
          placeholder="Confirm new password"
          className="border p-2 w-full rounded"
        />
        {errors.confirmPassword && (
          <p className="text-red-600 text-sm">
            {errors.confirmPassword.message}
          </p>
        )}
        <button
          type="submit"
          className="bg-purple-600 text-white p-2 rounded w-full"
        >
          {isPending ? "Changing..." : "Change Password"}
        </button>
      </form>
    </div>
  );
}
