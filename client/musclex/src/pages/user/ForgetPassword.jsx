import { useForm } from "react-hook-form";
import otpImg from "../../assets/otp.jpg";
import { useResendOTPForgetPassword } from "../../hooks/users/useOTP";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { useforgetPasswordCheck } from "../../hooks/users/useForgetPasswordcheck";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [time, setTime] = useState(0);

  const { register, handleSubmit } = useForm();
  const { mutate, isPending, error, isError } = useforgetPasswordCheck();
  const { mutate: resend, isPending: isLoading } = useResendOTPForgetPassword();

  const userId = sessionStorage.getItem("userId");
  const email = sessionStorage.getItem("email");

  const handleOTP = (data) => {
    mutate(
      { ...data, userId },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          sessionStorage.clear();
          navigate("/user/reset");
        },
      }
    );
  };

  // session guard
  useEffect(() => {
    const allowed = sessionStorage.getItem("forgetOtpAllowed");

    if (!allowed) {
      navigate("/user/login", { replace: true });
    }
  }, [navigate]);

  // restore timer
  useEffect(() => {
    const expiry = sessionStorage.getItem("otpResendExpiry");
    if (!expiry) return;

    const remaining = Math.ceil((Number(expiry) - Date.now()) / 1000);
    if (remaining > 0) setTime(remaining);
    else sessionStorage.removeItem("otpResendExpiry");
  }, []);

  // countdown
  useEffect(() => {
    if (time <= 0) return;

    const interval = setInterval(() => {
      setTime((prev) => {
        if (prev <= 1) {
          sessionStorage.removeItem("otpResendExpiry");
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [time]);

  const HandleResend = () => {
    if (!userId) {
      toast.error("Session expired. Please login again.");
      sessionStorage.clear();
      navigate("/user/login", { replace: true });
      return;
    }

    resend(
      { userId },
      {
        onSuccess: (data) => {
          toast.info(data.message);
          const expiryTime = Date.now() + 30 * 1000;
          sessionStorage.setItem("otpResendExpiry", expiryTime.toString());
          setTime(30);
        },
      }
    );
  };

  return (
    <div className="min-h-screen flex">
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold">Verify OTP</h1>
            <p className="text-sm text-gray-600">OTP sent to</p>
            <p className="text-sm text-red-500 font-medium">{email}</p>
          </div>

          <form onSubmit={handleSubmit(handleOTP)} className="space-y-5">
            {time > 0 && (
              <p className="text-right text-sm text-gray-500">
                Resend in {time}s
              </p>
            )}

            <input
              type="text"
              {...register("otp", { required: true })}
              className="w-full px-4 py-3 border rounded-md text-center text-lg"
              placeholder="enter otp"
              maxLength="6"
            />

            {isError && (
              <p className="text-red-600 text-xs text-center">
                {error.response?.data?.message}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-900 text-white py-3 rounded-md"
            >
              {isPending ? "VERIFYING" : "VERIFY"}
            </button>

            {/* ✅ DISABLED RESEND BUTTON */}
            <button
              type="button"
              onClick={HandleResend}
              disabled={time > 0}
              className={`w-full py-3 rounded-md text-white
                ${
                  time > 0
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-900 hover:bg-blue-800"
                }`}
            >
              {isLoading ? "RESENDING" : "RESEND OTP"}
            </button>
          </form>
        </div>
      </div>

      <div className="hidden md:block md:w-1/2">
        <img src={otpImg} className="h-full w-full object-cover" />
      </div>
    </div>
  );
}
