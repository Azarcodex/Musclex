import React from "react";
import { useForm } from "react-hook-form";
import registerBg from "../../assets/registerBg.jpg";
import { TextField, Button } from "@mui/material";
import { useRegister } from "../../hooks/users/userRegister";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const { mutate, isError, error, isPending } = useRegister();

  const onSubmit = (values) => {
    mutate(values, {
      onSuccess: (data) => {
        sessionStorage.clear();

        sessionStorage.setItem("userId", String(data.userId));
        sessionStorage.setItem("email", String(data.email));
        sessionStorage.setItem("otpAllowed", "true");

        toast.success("Verify the OTP");

        setTimeout(() => {
          navigate("/user/verify", { replace: true });
        }, 0);
      },
    });
  };
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="w-full md:w-1/2 bg-white flex items-center justify-center p-6 sm:p-8 md:p-12">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <div className="w-10 h-10 bg-gray-300 rounded-full mb-6"></div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
              Welcome to MuscleX Community
            </h1>
            <p className="text-sm text-gray-600">
              Already have an account? <Link to={"/user/login"}>Log in</Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Email Field */}
            <div>
              <TextField
                label="Email"
                type="email"
                fullWidth
                variant="outlined"
                size="small"
                {...register("email", { required: "Email is required" })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
            </div>

            {/* Username Field */}
            <div>
              <TextField
                label="name"
                type="text"
                fullWidth
                variant="outlined"
                size="small"
                {...register("name", { required: "Username is required" })}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            </div>

            {/* Password Field */}
            <div>
              <TextField
                label="Password"
                type="password"
                fullWidth
                variant="outlined"
                size="small"
                {...register("password", { required: "Password is required" })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
            </div>
            <div>
              <TextField
                label="referralCode"
                type="text"
                fullWidth
                variant="outlined"
                size="small"
                {...register("referralCode")}
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              disabled={isPending}
              fullWidth
              sx={{
                mt: 2,
                bgcolor: "#4A148C",
                ":hover": { bgcolor: "#6A1B9A" },
                textTransform: "none",
              }}
            >
              {isPending ? "Registering" : "create Account"}
            </Button>
            {isError && (
              <p className="text-red-600 text-sm sm:text-base mt-2 text-center">
                {error?.response?.data?.message || "registration failed"}
              </p>
            )}
          </form>

          {/* Footer Link */}
          <p className="text-sm text-gray-600 text-center mt-6">
            Already have an account? <Link to={"/user/login"}>Log in</Link>
          </p>
        </div>
      </div>

      {/* Right Side - Image Placeholder */}
      <div className=" bg-gray-800 w-3/5">
        <img src={registerBg} alt="" className="h-full" />
      </div>
    </div>
  );
};

export default Register;
