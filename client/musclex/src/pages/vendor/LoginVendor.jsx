import { useForm } from "react-hook-form";
import registerBg from "../../assets/registerBg.jpg";
import { useUserLogin } from "../../hooks/users/useUserLogin";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { useVendorLogin } from "../../hooks/vendor/useVendorLogin";
import { toast } from "sonner";
import { useEffect } from "react";
import { setAuthtoken } from "../../api/axios";
export default function LoginVendor() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { mutate, isError, error, isPending } = useVendorLogin();
  const submitLogin = (data) => {
    mutate(data, {
      onSuccess: (data) => {
        console.log(data);
        if (data?.token) {
          setAuthtoken(data.token, data?.vendor.role);
          toast.success(`${data.message}`);
          setTimeout(() => {
            navigate("/vendor/dashboard", { replace: true });
          }, 120);
        }
      },
      onError: (err) => {
        toast.error(`${err.response.data.message}`);
      },
    });
  };
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Image Placeholder */}
      <div className="hidden md:block md:w-1/2 bg-gradient-to-br from-blue-900 via-gray-900 to-black">
        {/* <div className="h-full flex items-center justify-center"> */}
        <img src={registerBg} alt="fitness#" className="h-full" />
        {/* </div> */}
      </div>

      {/* Right Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <p className="text-sm text-gray-600 text-right mb-8">
              Don't have an account?{" "}
              <Link to={"/vendor/register"}>Sign Up</Link>
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Sign in</h1>
          </div>
          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit(submitLogin)}>
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                email address
              </label>
              <input
                type="text"
                {...register("email", {
                  required: " email is required",
                })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent"
                placeholder="Enter your email"
              />
              {errors.email && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your password
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("password", {
                    required: "Password is required",
                  })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>
              {/* {errors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.password.message}
                </p>
              )} */}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-full transition duration-200 text-sm"
            >
              {isPending ? "signing" : "sign in"}
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account? <Link to={"/vendor/register"}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
