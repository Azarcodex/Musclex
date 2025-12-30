import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAddVariant } from "../../hooks/vendor/useAddVariant";
import { useRelatedVariantProduct } from "../../hooks/vendor/useRelatedVariantProcuct";
import { LucideCamera, X } from "lucide-react";
import CropperModal from "../../components/crop/CropperModel";

const VariantForm = () => {
  const { productId } = useParams();

  // Cropper states (MULTIPLE IMAGE QUEUE)
  const [cropQueue, setCropQueue] = useState([]);
  const [currentCrop, setCurrentCrop] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const { data: productList } = useRelatedVariantProduct(productId);

  const { mutate } = useAddVariant();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      flavour: "",
      sizes: [{ label: "", oldPrice: "", salePrice: "", stock: "", sku: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "sizes",
  });

  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState([]);

  const HandleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    // enforce max 3 images
    if (selectedFiles.length + files.length > 3) {
      toast.error("You can only upload 3 images");
      e.target.value = "";
      return;
    }

    // queue selected files for cropping
    const queueItems = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
    }));

    setCropQueue((prev) => [...prev, ...queueItems]);

    // start cropping immediately if idle
    if (!showCropper) {
      setCurrentCrop(queueItems[0]);
      setShowCropper(true);
    }

    e.target.value = "";
  };

  // When user finishes cropping ONE image
  const handleCroppedImage = (blob) => {
    const file = new File([blob], "cropped.png", { type: "image/png" });

    setSelectedFiles((prev) => [...prev, file]);
    setPreviewImage((prev) => [...prev, URL.createObjectURL(blob)]);

    // remove first item from queue
    setCropQueue((prev) => prev.slice(1));
  };

  // Process next image in queue automatically
  useEffect(() => {
    if (cropQueue.length > 0) {
      setCurrentCrop(cropQueue[0]);
      setShowCropper(true);
    } else {
      setShowCropper(false);
      setCurrentCrop(null);
    }
  }, [cropQueue]);

  // -----------------------------------------
  // DELETE IMAGE
  // -----------------------------------------
  const HandleDeleteImg = (idx) => {
    const updatedFiles = selectedFiles.filter((_, id) => id !== idx);
    const updatePreview = previewImage.filter((_, id) => id !== idx);
    setSelectedFiles(updatedFiles);
    setPreviewImage(updatePreview);
  };

  // -----------------------------------------
  // SUBMIT FORM
  // -----------------------------------------
  const onSubmit = (data) => {
    if (selectedFiles.length < 1) {
      toast.error("Please upload at least one image.");
      return;
    }

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("flavour", data.flavour);
    formData.append("size", JSON.stringify(data.sizes));
    selectedFiles.forEach((file) => formData.append("images", file));

    mutate(formData, {
      onSuccess: (res) => {
        toast.success(res.message);
        reset();
        setSelectedFiles([]);
        setPreviewImage([]);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Something went wrong!");
      },
    });
  };

  // -----------------------------------------
  // UI
  // -----------------------------------------
  return (
    <div className="bg-purple-50 p-5 min-h-screen">
      {/* Product Header */}
      <div className="bg-white text-pink-700 font-bold flex flex-wrap gap-4 items-center justify-evenly text-sm p-3 border-b-2 border-violet-600">
        <h1 className="text-purple-950 font-bold text-2xl">Product Details:</h1>
        <h4>
          <span className="text-purple-600 font-semibold">Product Name:</span>{" "}
          {productList?.product?.name}
        </h4>
        <h4>
          <span className="text-purple-600 font-semibold">Category:</span>{" "}
          {productList?.product?.catgid?.catgName}
        </h4>
        <h4>
          <span className="text-purple-600 font-semibold">Brand:</span>{" "}
          {productList?.product?.brandID?.brand_name}
        </h4>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-10 space-y-8">
        <div>
          <label className="block font-semibold text-purple-800 mb-1">
            Flavour
          </label>
          <input
            {...register("flavour")}
            placeholder="Enter flavour name if needed for your category"
            className="border-b-2 border-purple-950 outline-0 w-full bg-transparent"
          />
          {/* {errors.flavour && (
              <p className="text-red-600">{errors.flavour.message}</p>
            )} */}
        </div>

        {/* Sizes Section */}
        <div className="bg-white p-5 rounded-md shadow-md border border-purple-100">
          <h2 className="text-lg font-bold text-purple-700 mb-4">
            Size Variants
          </h2>

          {fields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-2 gap-4 mb-4 border-b pb-4 relative"
            >
              <div>
                <label className="block text-sm font-semibold">
                  *Size Label
                </label>
                <input
                  {...register(`sizes.${index}.label`, {
                    required: "enter size",
                  })}
                  placeholder="e.g. 1kg, 500ml"
                  className="border-b border-purple-800 outline-none w-full bg-transparent"
                />
                {errors?.sizes?.[index]?.label && (
                  <p className="text-red-600 text-sm">
                    {errors.sizes[index].label.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold">*Old Price</label>
                <input
                  {...register(`sizes.${index}.oldPrice`, {
                    required: "enter old price",
                  })}
                  type="number"
                  placeholder="Enter old price"
                  className="border-b border-purple-800 outline-none w-full bg-transparent"
                />
                {errors?.sizes?.[index]?.oldPrice && (
                  <p className="text-red-600 text-sm">
                    {errors.sizes[index].oldPrice.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold">
                  *Sale Price
                </label>
                <input
                  {...register(`sizes.${index}.salePrice`, {
                    required: "enter salePrice",
                  })}
                  type="number"
                  placeholder="Enter sale price"
                  className="border-b border-purple-800 outline-none w-full bg-transparent"
                />
                {errors?.sizes?.[index]?.salePrice && (
                  <p className="text-red-600 text-sm">
                    {errors.sizes[index].salePrice.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold">*Stock</label>
                <input
                  {...register(`sizes.${index}.stock`, {
                    required: "Enter stock",
                  })}
                  type="number"
                  placeholder="Enter stock count"
                  className="border-b border-purple-800 outline-none w-full bg-transparent"
                />
                {errors?.sizes?.[index]?.stock && (
                  <p className="text-red-600 text-sm">
                    {errors.sizes[index].stock.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold">*SKU</label>
                <input
                  {...register(`sizes.${index}.sku`, {
                    required: "just enter a sku code",
                  })}
                  placeholder="Eg: CHOC-1KG-4821"
                  className="border-b border-purple-800 outline-none w-full bg-transparent"
                />
                {errors?.sizes?.[index]?.sku && (
                  <p className="text-red-600 text-sm">
                    {errors.sizes[index].sku.message}
                  </p>
                )}
              </div>

              <button
                type="button"
                className="absolute right-0 top-0 text-red-600 hover:text-red-800"
                onClick={() => remove(index)}
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          ))}

          <button
            type="button"
            className="text-purple-600 border border-purple-600 px-4 py-1 rounded-md hover:bg-purple-50"
            onClick={() =>
              append({
                label: "",
                oldPrice: "",
                salePrice: "",
                stock: "",
                sku: "",
              })
            }
          >
            + Add Size
          </button>
        </div>

        {/* Image Upload */}
        <div className="flex flex-col items-center justify-center mt-10">
          <label
            htmlFor="images"
            className="flex flex-col items-center cursor-pointer bg-purple-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200"
          >
            <LucideCamera className="w-5 h-5" />
            Choose Images
          </label>
          <input
            id="images"
            type="file"
            accept="image/*"
            onChange={HandleImageChange}
            className="hidden"
          />
        </div>

        {/* Image Preview */}
        {previewImage.length > 0 && (
          <div className="flex flex-wrap gap-3 mt-5 justify-center">
            {previewImage.map((src, idx) => (
              <div key={idx} className="relative">
                <img
                  src={src}
                  alt="Preview"
                  className="w-28 h-28 rounded-md object-cover border border-purple-200"
                />
                <X
                  className="absolute top-1 right-1 text-red-600 bg-white rounded-full p-0.5 cursor-pointer"
                  onClick={() => HandleDeleteImg(idx)}
                />
              </div>
            ))}
          </div>
        )}
        {/* Hidden validator for images */}
        <input
          type="hidden"
          {...register("imagesCheck", {
            validate: () =>
              selectedFiles.length > 0 || "Please upload at least one image.",
          })}
        />

        {errors.imagesCheck && (
          <p className="text-red-600 text-sm mt-1">
            {errors.imagesCheck.message}
          </p>
        )}

        {/* Submit */}
        <div className="flex items-center justify-center mt-8">
          <button
            type="submit"
            className="bg-violet-600 text-white px-6 py-3 rounded-md font-semibold uppercase hover:bg-purple-800 transition"
          >
            Add Variant
          </button>
        </div>
      </form>

      {/* Cropper Modal */}
      {showCropper && currentCrop && (
        <CropperModal
          image={currentCrop.url}
          onCropDone={handleCroppedImage}
          onClose={() => {
            setCropQueue([]);
            setShowCropper(false);
            setCurrentCrop(null);
          }}
        />
      )}
    </div>
  );
};

export default VariantForm;
