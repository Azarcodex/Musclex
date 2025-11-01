import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { useAddVariant } from "../../hooks/vendor/useAddVariant";

const VariantForm = () => {
  const { productId } = useParams(); // ✅ Get product ID from URL
  const { register, handleSubmit, reset } = useForm();
  const { mutate, isPending } = useAddVariant();

  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]); // ✅ Store actual files

  // Handle image preview + store real files
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files); // ✅ Real FileList
    setPreviewImages(files.map((file) => URL.createObjectURL(file)));
  };

  // Submit form data
  const onSubmit = (data) => {
    const payload = {
      ...data,
      productId,
      images: selectedFiles, // ✅ Attach real files here
    };

    mutate(payload, {
      onSuccess: () => {
        reset();
        setPreviewImages([]);
        setSelectedFiles([]);
      },
    });
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow rounded-xl mt-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        Add Variant for Product
      </h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Color */}
        <input
          {...register("color")}
          placeholder="Color"
          className="border p-2 w-full rounded"
        />

        {/* Size */}
        <input
          {...register("size")}
          placeholder="Size"
          className="border p-2 w-full rounded"
        />

        {/* Flavour */}
        <input
          {...register("flavour")}
          placeholder="Flavour"
          className="border p-2 w-full rounded"
        />

        {/* Prices */}
        <input
          {...register("oldPrice", { required: true })}
          placeholder="Old Price"
          type="number"
          className="border p-2 w-full rounded"
        />
        <input
          {...register("salePrice")}
          placeholder="Sale Price"
          type="number"
          className="border p-2 w-full rounded"
        />

        {/* Stock */}
        <input
          {...register("stock", { required: true })}
          placeholder="Stock"
          type="number"
          className="border p-2 w-full rounded"
        />

        {/* Offer Checkbox */}
        <label className="flex items-center gap-2">
          <input type="checkbox" {...register("isOnOffer")} />
          On Offer?
        </label>

        {/* Image Upload */}
        <input
          type="file"
          name="images"
          multiple
          accept="image/*"
          onChange={handleImageChange}
          className="border p-2 w-full rounded"
        />

        {/* Image Preview */}
        {previewImages.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mt-2">
            {previewImages.map((src, idx) => (
              <img
                key={idx}
                src={src}
                alt="preview"
                className="h-24 w-24 object-cover rounded-lg border"
              />
            ))}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isPending}
          className="bg-blue-600 text-white w-full py-2 rounded hover:bg-blue-700 transition"
        >
          {isPending ? "Uploading..." : "Add Variant"}
        </button>
      </form>
    </div>
  );
};

export default VariantForm;
