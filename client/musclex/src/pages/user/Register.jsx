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
  //   return (
  //     // <div className="min-h-screen flex justify-center items-center bg-gray-100">
  //     //   <form
  //     //     // onSubmit={handleSubmit(onSubmit)}
  //     //     className="p-8 bg-white shadow-lg rounded-md w-full max-w-sm space-y-4"
  //     //   >
  //     //     <h2 className="text-2xl font-bold text-center text-violet-800">
  //     //       Register
  //     //     </h2>

  //     //     <input
  //     //       {...register("name", { required: true })}
  //     //       type="text"
  //     //       placeholder="Name"
  //     //       className="border w-full p-2 rounded"
  //     //     />

  //     //     <input
  //     //       {...register("email", { required: true })}
  //     //       type="email"
  //     //       placeholder="Email"
  //     //       className="border w-full p-2 rounded"
  //     //     />

  //     //     <input
  //     //       {...register("password", { required: true })}
  //     //       type="password"
  //     //       placeholder="Password"
  //     //       className="border w-full p-2 rounded"
  //     //     />

  //     //     <input
  //     //       {...register("phoneNumber", { required: true })}
  //     //       type="text"
  //     //       placeholder="Phone Number"
  //     //       className="border w-full p-2 rounded"
  //     //     />

  //     //     <button
  //     //       type="submit"
  //     //       className="bg-violet-700 text-white w-full py-2 rounded hover:bg-violet-800"
  //     //       //   disabled={isLoading}
  //     //     >
  //     //       {/* {isLoading ? "Registering..." : "Register"} */}
  //     //       register
  //     //     </button>

  //     //     {/* {isError && (
  //     //       <p className="text-red-600 text-sm">{error?.response?.data?.message}</p>
  //     //     )} */}
  //     //   </form>
  //     // </div>
  //   );

  const onSubmit = (values) => {
    mutate(values, {
      onSuccess: (data) => {
        toast.success("verify the OTP");
        localStorage.setItem("userId", data.userId);
        localStorage.setItem("email", data.email);
        navigate("/user/verify");
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
