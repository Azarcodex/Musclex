import React from "react";
import { useForm } from "react-hook-form";
import registerBg from "../../assets/registerBg.jpg";
import { TextField, Button } from "@mui/material";
import { useRegister } from "../../hooks/users/userRegister";
import { Link, useNavigate } from "react-router-dom";
import { Toaster, toast } from "sonner";
import { useVendorRegister } from "../../hooks/vendor/useVendorRegister";
const Register = () => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const { mutate, isPending, error, isError } = useVendorRegister();
  const submit = (data) => {
    mutate(data, {
      onSuccess: (sets) => {
        if (sets.success) {
          toast.success(`${sets.message}-${sets.approval}`);
          reset();
        } else {
          toast.error(`${sets.message}`);
        }
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
              Already have an account? <Link to={"/vendor/login"}>Log in</Link>
            </p>
          </div>

          {/* Form */}
          <form className="space-y-6" onSubmit={handleSubmit(submit)}>
            {/*shopName*/}
            <div>
              <TextField
                label="shopName"
                type="text"
                fullWidth
                variant="outlined"
                size="small"
                {...register("shopName", { required: "shopName is required" })}
                error={!!errors.shopName}
                helperText={errors.shopName?.message}
              />
            </div>
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
            {/* Number Field */}
            <div>
              <TextField
                label="phone"
                type="number"
                fullWidth
                variant="outlined"
                size="small"
                {...register("phone", { required: "phone number is required" })}
                error={!!errors.phone}
                helperText={errors.phone?.message}
              />
            </div>
            {/*Address */}
            {/*shopName*/}
            <div>
              <TextField
                label="place"
                type="text"
                fullWidth
                variant="outlined"
                size="small"
                {...register("place", { required: "place is required" })}
                error={!!errors.place}
                helperText={errors.place?.message}
              />
            </div>
            {/* Submit Button */}
            <Button
              type="submit"
              variant="contained"
              //   disabled={isPending}
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
            Already have an account? <Link to={"/vendor/login"}>Log in</Link>
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
