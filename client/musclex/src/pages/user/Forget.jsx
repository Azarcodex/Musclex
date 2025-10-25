import React from "react";
import { useForm } from "react-hook-form";
import forget from "../../assets/forget.jpg";
import { useForgetPassword } from "../../hooks/users/useForgetPassword";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
const Forget = () => {
  const navigate = useNavigate();
  const { register, handleSubmit } = useForm();
  const { mutate, error, isError, isPending } = useForgetPassword();
  const submit = (data) => {
    mutate(data, {
      onSuccess: (values) => {
        console.log(values);
        if (values.success) {
          toast.success(`${values.message}`);
          localStorage.setItem("email", values.email);
          localStorage.setItem("userId",values.userId)
          navigate("/user/verifyForget");
        } else {
          toast.error(`${values.message}`);
        }
      },
      onError: (err) => {
        console.log(err);
      },
    });
  };
  return (
    <div className="min-h-screen w-full flex">
      <div className=" w-1/2 flex justify-center items-center flex-col space-y-6">
        <h3 className="font-bold text-4xl">Forgotten your Password?</h3>
        <form
          onSubmit={handleSubmit(submit)}
          className="flex items-center flex-col space-y-5"
        >
          <input
            type="text"
            name="email"
            {...register("email", { required: "email is required" })}
            className="border-1 border-gray-500 outline-none p-1 w-[17rem] rounded-sm"
            placeholder="enter email here"
          />
          <div className="flex items-center gap-5">
            <button
              className="text-white border-1 border-white w-[8rem] p-1 rounded-sm"
              style={{ background: "#000842" }}
            >
              cancel
            </button>
            <button
              type="submit"
              className="text-white border-1 border-white w-[8rem] p-1 rounded-sm"
              style={{ background: "#000842" }}
            >
              {isPending ? "submitting" : "submit"}
            </button>
          </div>
        </form>
      </div>
      <div className="h-screen w-1/2 flex items-center justify-center">
        <img src={forget} alt="image" className="h-full" />
      </div>
    </div>
  );
};

export default Forget;
