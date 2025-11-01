import { useForm } from "react-hook-form";
import registerBg from "../../assets/registerBg.jpg";
import { useUserLogin } from "../../hooks/users/useUserLogin";
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from "../../hooks/users/useGoogleLogin";
import { GoogleLogin } from "@react-oauth/google";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect } from "react";
import { userAuthStore } from "../../hooks/users/zustand/useAuth";
import { setAuthtoken } from "../../api/axios";
export default function LoginUser() {
  const navigate = useNavigate();
  const { setToken } = userAuthStore();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { mutate, isPending, isError, error } = useUserLogin();
  const { mutate: googleAuth } = useGoogleLogin();
  const onSubmit = (data) => {
    mutate(data);
  };
  const handleGoogleSuccess = (credentialResponse) => {
    const decoded = jwtDecode(credentialResponse.credential);
    console.log("Google user info:", decoded);

    googleAuth(credentialResponse.credential, {
      onSuccess: (data) => {
        console.log("Login success:", data);
        toast.success("Google login successful!");
        setToken(data.token);
        setAuthtoken(data.token, data?.user.role);
        navigate("/");
      },
      onError: (error) => {
        console.error(error);
        toast.error("Google login failed!");
      },
    });
  };

  const handleGoogleError = () => {
    toast.error("Google Login Failed");
  };
  //session handling
  useEffect(() => {
    const token = localStorage.getItem("user");
    if (token) {
      navigate("/");
    }
  }, [navigate]);
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
              Don't have an account? <Link to={"/user/register"}>Sign Up</Link>
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Sign in</h1>
          </div>
          <div className="flex items-center justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
            />
          </div>
          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex-1 border-t border-gray-300"></div>
            <span className="text-sm text-gray-500">OR</span>
            <div className="flex-1 border-t border-gray-300"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                email address
              </label>
              <input
                type="text"
                {...register("email")}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent"
                placeholder="Enter your username or email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Your password
              </label>
              <div className="relative">
                <input
                  type="password"
                  {...register("password")}
                  className="w-full px-4 py-3 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-transparent pr-12"
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 text-xs flex items-center gap-1"
                >
                  {/* <span>👁</span>
                  <span>Hide</span> */}
                </button>
              </div>
              {/* {errors.password && (
                <p className="text-red-600 text-xs mt-1">
                  {errors.password.message}
                </p>
              )} */}
            </div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <Link
                to={"/user/forget"}
                className="text-sm text-gray-600 hover:text-blue-600 underline"
              >
                Forgot your password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gray-300 hover:bg-gray-400 text-gray-700 font-medium py-3 px-4 rounded-full transition duration-200 text-sm"
            >
              Sign in
            </button>
          </form>

          {/* Footer Link */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account? <Link to={"/user/register"}>Sign Up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
