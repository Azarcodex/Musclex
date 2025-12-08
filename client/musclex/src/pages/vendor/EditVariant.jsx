import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { LucideCamera, X, PlusCircle } from "lucide-react";
import { useGetVariants } from "../../hooks/vendor/useGetVariant";
import { useVariantImageRemove } from "../../hooks/vendor/useVariantImageRemove";
import { useQueryClient } from "@tanstack/react-query";
import { useEditVariant } from "../../hooks/vendor/useEditVariant";
import { confirm } from "../../components/utils/Confirmation";
import { useRelatedVariantProduct } from "../../hooks/vendor/useRelatedVariantProcuct";

const EditVariant = () => {
  const { productId, variantId } = useParams();
  const navigate = useNavigate();
  const PORT = import.meta.env.VITE_API_URL;

  const { data: productList } = useRelatedVariantProduct(productId);
  const isSupplement =
    productList?.product?.catgid?.catgName?.toLowerCase() === "supplements";

  const { data: variants } = useGetVariants(productId);
  const variant = variants?.find((item) => item._id === variantId);

  const queryClient = useQueryClient();
  const { mutate: deleteImg } = useVariantImageRemove();
  const { mutate: editVariant } = useEditVariant();

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState([]);
  const [existingImg, setExistingImg] = useState([]);

  // ----------------------------------------
  // VALIDATION ADDED   ← IMPORTANT
  // ----------------------------------------
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      flavour: isSupplement ? "" : "default",
      sizes: [{ label: "", oldPrice: "", salePrice: "", stock: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes",
  });

  // Populate form from existing variant
  useEffect(() => {
    if (variant) {
      reset({
        flavour: variant.flavour,
        sizes: variant.size?.map((s) => ({
          label: s.label,
          oldPrice: s.oldPrice,
          salePrice: s.salePrice,
          stock: s.stock,
        })) || [{ label: "", oldPrice: "", salePrice: "", stock: "" }],
      });
      setExistingImg(variant.images);
    }
  }, [variant, reset]);

  // Handle new images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
    setPreviewImage(files.map((file) => URL.createObjectURL(file)));
  };

  // Delete existing image
  const handleDeleteImage = async (src) => {
    const confirmed = await confirm({ message: "Remove this image?" });
    if (confirmed) {
      deleteImg(
        { variantId, src },
        {
          onSuccess: (data) => {
            setExistingImg((prev) => prev.filter((img) => img !== src));
            queryClient.invalidateQueries(["variants"]);
            toast.success(data.message);
          },
        }
      );
    }
  };

  // Submit form
  const onSubmit = (data) => {
    const formdata = new FormData();
    formdata.append("flavour", data.flavour);
    formdata.append("size", JSON.stringify(data.sizes));

    selectedFiles.forEach((file) => formdata.append("images", file));

    editVariant(
      { variantId, formdata },
      {
        onSuccess: (res) => {
          toast.success(res.message);
          queryClient.invalidateQueries(["variants"]);
          navigate(`/vendor/dashboard/variant/${productId}`);
        },
        onError: (err) => {
          toast.error(err.response?.data?.message || "Error updating variant");
        },
      }
    );
  };

  return (
    <div>
      <h1 className="capitalize text-purple-800 text-2xl font-semibold font-mono mb-4">
        Edit Variant
      </h1>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-purple-50 p-5 rounded-lg shadow"
      >
        {/* Flavour Field */}
        {isSupplement && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-purple-800 mb-1">
              Flavour
            </label>
            <input
              {...register("flavour", {
                required: "Enter flavour name",
              })}
              placeholder="Flavour name (e.g. Strawberry)"
              className="border-b-2 border-purple-950 outline-0 bg-transparent p-2 w-full"
              autoComplete="off"
            />
            {errors.flavour && (
              <p className="text-red-600 text-sm">{errors.flavour.message}</p>
            )}
          </div>
        )}

        {/* Size Variants */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-3">
            <h2 className="text-purple-700 font-semibold text-lg">
              Size Variants
            </h2>
            <button
              type="button"
              onClick={() =>
                append({ label: "", oldPrice: "", salePrice: "", stock: "" })
              }
              className="flex items-center gap-2 text-sm text-purple-700 hover:text-purple-900 transition"
            >
              <PlusCircle className="w-4 h-4" />
              Add Size
            </button>
          </div>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-4 gap-3 items-center mb-3 border-b border-purple-200 pb-2"
            >
              {/* Label */}
              <div>
                <input
                  {...register(`sizes.${index}.label`, {
                    required: "Enter size",
                  })}
                  placeholder="Label (e.g. 1kg)"
                  className="border-b border-purple-400 outline-none bg-transparent p-1 w-full"
                />
                {errors?.sizes?.[index]?.label && (
                  <p className="text-red-600 text-sm">
                    {errors.sizes[index].label.message}
                  </p>
                )}
              </div>

              {/* Old Price */}
              <div>
                <input
                  {...register(`sizes.${index}.oldPrice`, {
                    required: "Enter old price",
                  })}
                  placeholder="Old Price"
                  className="border-b border-purple-400 outline-none bg-transparent p-1 w-full"
                />
                {errors?.sizes?.[index]?.oldPrice && (
                  <p className="text-red-600 text-sm">
                    {errors.sizes[index].oldPrice.message}
                  </p>
                )}
              </div>

              {/* Sale Price */}
              <div>
                <input
                  {...register(`sizes.${index}.salePrice`, {
                    required: "Enter sale price",
                  })}
                  placeholder="Sale Price"
                  className="border-b border-purple-400 outline-none bg-transparent p-1 w-full"
                />
                {errors?.sizes?.[index]?.salePrice && (
                  <p className="text-red-600 text-sm">
                    {errors.sizes[index].salePrice.message}
                  </p>
                )}
              </div>

              {/* Stock */}
              <div>
                <div className="flex gap-2 items-center">
                  <input
                    {...register(`sizes.${index}.stock`, {
                      required: "Enter stock",
                    })}
                    placeholder="Stock"
                    className="border-b border-purple-400 outline-none bg-transparent p-1 flex-1"
                  />
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
                {errors?.sizes?.[index]?.stock && (
                  <p className="text-red-600 text-sm">
                    {errors.sizes[index].stock.message}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Existing Images */}
        <div className="flex flex-wrap gap-4 justify-center mt-6">
          {existingImg.map((src, idx) => (
            <div key={idx} className="relative w-32 h-32">
              <img
                src={`${PORT}${src}`}
                alt="variant"
                className="w-full h-full object-cover rounded-md"
              />
              <button
                type="button"
                onClick={() => handleDeleteImage(src)}
                className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>

        {/* Upload New Images */}
        <div className="flex flex-col items-center justify-center mt-8">
          <label
            htmlFor="images"
            className="flex flex-col items-center cursor-pointer bg-purple-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
          >
            <LucideCamera className="w-5 h-5" />
            Add Images
          </label>
          <input
            id="images"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
          />
        </div>

        {/* Preview New Images */}
        {previewImage.length > 0 && (
          <div className="flex flex-wrap gap-4 justify-center mt-4">
            {previewImage.map((src, idx) => (
              <div key={idx} className="relative w-32 h-32">
                <img
                  src={src}
                  alt="preview"
                  className="w-full h-full object-cover rounded-md"
                />
                <button
                  type="button"
                  onClick={() =>
                    setPreviewImage(previewImage.filter((_, i) => i !== idx))
                  }
                  className="absolute top-1 right-1 bg-pink-600 text-white rounded-full p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Submit */}
        <div className="flex items-center justify-center w-full py-2 mt-10">
          <button className="border-2 border-purple-900 px-3 py-3 rounded-md bg-violet-600 uppercase text-white w-1/4 hover:bg-purple-900 transition">
            Update Variant
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditVariant;
