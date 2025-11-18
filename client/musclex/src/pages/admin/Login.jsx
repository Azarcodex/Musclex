import React, { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { useAdminLogin } from "../../hooks/admin/useAdminLogin";
import { Navigate, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const Login = () => {
  const navigate = useNavigate();
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const { mutate: login, isLoading, isError, error, data } = useAdminLogin();
  const { token } = useSelector((state) => state.adminAuth);
  // console.log(token);
  const onSubmit = (values) => {
    console.log(values);
    login(values);
  };
  useEffect(() => {
    if (token) {
      navigate("/admin/dashboard", { replace: true });
    }
  }, [navigate,token]);
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col items-center justify-center text-center gap-2 mb-8 sm:mb-12">
        <h1 className="text-violet-900 text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold">
          Welcome Back
        </h1>
        <h2 className="text-violet-900 text-base sm:text-lg md:text-xl lg:text-2xl font-semibold">
          Sign in with your credentials
        </h2>
      </div>

      {/* Form */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg p-4 sm:p-6 md:p-8 rounded-lg shadow-lg bg-white"
      >
        <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-6 text-center">
          Admin Login
        </h2>

        {/* Email */}
        <Controller
          name="email"
          control={control}
          rules={{ required: "Email is required" }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Email"
              type="email"
              fullWidth
              variant="outlined"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              margin="dense"
              sx={{ mb: 2 }}
            />
          )}
        />

        {/* Password */}
        <Controller
          name="password"
          control={control}
          rules={{ required: "Password is required" }}
          render={({ field, fieldState }) => (
            <TextField
              {...field}
              label="Password"
              type="password"
              fullWidth
              variant="outlined"
              error={!!fieldState.error}
              helperText={fieldState.error?.message}
              margin="dense"
              sx={{ mb: 3 }}
            />
          )}
        />

        {/* Submit Button */}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={isLoading}
          sx={{
            py: 1.5,
            bgcolor: "purple.900",
            fontSize: { xs: "0.9rem", sm: "1rem", md: "1.1rem" },
            ":hover": { bgcolor: "purple.800" },
            mb: 2,
          }}
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </Button>

        {/* Error / Success Messages */}
        {isError && (
          <p className="text-red-600 text-sm sm:text-base mt-2 text-center">
            {error?.response?.data?.message || "Login failed"}
          </p>
        )}

        {data && !isError && (
          <p className="text-green-600 text-sm sm:text-base mt-2 text-center">
            Login successful — redirecting...
          </p>
        )}
      </form>
    </div>
  );
};

export default Login;
