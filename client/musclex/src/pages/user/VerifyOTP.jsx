import { useForm } from "react-hook-form";
import otpImg from "../../assets/otp.jpg";
import { useOTP, useResendOTP } from "../../hooks/users/useOTP";
import { useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useEffect, useEffectEvent, useState } from "react";
export default function VerifyOTP() {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { mutate, isPending, error, isError} = useOTP();
  const { mutate: resend, isPending: isLoading ,data} = useResendOTP();
  const userId = localStorage.getItem("userId");
  const email = localStorage.getItem("email");
  const [time, setTime] = useState(0);
  //timer
  useEffect(() => {
    let interval;
    if (time > 0) {
      interval = setInterval(() => {
        setTime((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [time]);
  //---
  const onSubmit = (data) => {
    mutate(
      { ...data, userId },
      {
        onSuccess: () => {
          toast.success("otp has been Verified");
          localStorage.removeItem("userId");
          localStorage.removeItem("email");
          navigate("/user/login", { replace: true });
        },
      }
    );
  };
  useEffect(() => {
    const userid = localStorage.getItem("userId");
    if (!userId) {
      navigate("/user/register");
    }
  }, []);
  //resend otp
  const HandleResend = () => {
    // console.log("clicked");
    resend(
      { email, userId },
      {
        onSuccess: (data) => {
          console.log(data)
          toast.info(`${data.message}`);
          setTime(30);
        },
      }
    );
  };
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-sm">
          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <svg
                className="w-8 h-8 text-blue-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Verify OTP
            </h1>
            <p className="text-sm text-gray-600">OTP sent to</p>
            <p className="text-sm text-red-500 font-medium">{email}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {time > 0 && <h1 className="text-right">{time}</h1>}

            {/* OTP Input */}
            <div>
              <input
                type="text"
                {...register("otp", { required: "OTP is required" })}
                className="w-full px-4 py-3 border border-gray-300 rounded-md text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="enter otp"
                maxLength="6"
              />
              {isError && (
                <p className="text-red-600 text-xs mt-1 text-center">
                  {error.response?.data?.message}
                </p>
              )}
            </div>

            {/* Verify Button */}
            <button
              type="submit"
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-md transition duration-200 text-sm uppercase tracking-wide"
            >
              {isPending ? "verifying" : "verify"}
            </button>

            {/* Resend Button */}
            <button
              type="button"
              className="w-full bg-blue-900 hover:bg-blue-800 text-white font-semibold py-3 px-4 rounded-md transition duration-200 text-sm uppercase tracking-wide"
              onClick={HandleResend}
            >
              {isLoading ? "RESENDING" : "RESEND OTP"}
            </button>
          </form>
        </div>
      </div>

      {/* Right Side - Image Placeholder */}
      <div className="hidden md:block md:w-1/2 min-h-screen">
        <img src={otpImg} className="h-full" />
      </div>
    </div>
  );
}
