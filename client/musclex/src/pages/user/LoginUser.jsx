import { useForm } from "react-hook-form";
import registerBg from "../../assets/registerBg.jpg";
import { useUserLogin } from "../../hooks/users/useUserLogin";
import { jwtDecode } from "jwt-decode";
import { useGoogleLogin } from "../../hooks/users/useGoogleLogin";
import { GoogleLogin } from "@react-oauth/google";
import { Link } from "react-router-dom";
export default function LoginUser() {
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
        localStorage.setItem("token", data.token);
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
              <Link to={"/user/register"}>
                <a className="text-blue-600 hover:underline font-medium">
                  Sign up
                </a>
              </Link>
            </p>
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Sign in</h1>
          </div>

          {/* Google Sign In Button */}
          {/* <button
            type="button"
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition duration-200 mb-6"
          onClick={handleGoogleSuccess} onError={handleGoogleError}
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            <span className="text-sm font-medium text-gray-700">
              Continue with Google
            </span>
          </button> */}
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
                {...register("email", {
                  required: " email is required",
                })}
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
                  {...register("password", {
                    required: "Password is required",
                  })}
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
            {isError && (
              <p className="text-red-600 text-xs mt-1">
                {error.response?.data?.message}
              </p>
            )}
          </form>

          {/* Footer Link */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Don't have an account?{" "}
            <Link to={"/user/register"}>
              <a className="text-blue-600 hover:underline font-medium">
                Sign up
              </a>
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
