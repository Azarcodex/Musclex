import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAddVariant } from "../../hooks/vendor/useAddVariant";
import { useRelatedVariantProduct } from "../../hooks/vendor/useRelatedVariantProcuct";
import { Camera, LucideCamera, X } from "lucide-react";
import { useGetVariants } from "../../hooks/vendor/useGetVariant";
import { useVariantImageRemove } from "../../hooks/vendor/useVariantImageRemove";
import { confirm } from "../../components/utils/Confirmation";
import { useQueryClient } from "@tanstack/react-query";
import { useEditVariant } from "../../hooks/vendor/useEditVariant";

const EditVariant = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const PORT = import.meta.env.VITE_API_URL;
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState([]);
  const [trackKey, setTrackKey] = useState(Date.now());
  const { mutate: deleteImg } = useVariantImageRemove();
  const { mutate: editVariant } = useEditVariant();
  const HandleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    previewImage.forEach((url) => URL.revokeObjectURL(url));
    const allFiles = [...selectedFiles, ...files];
    setSelectedFiles(allFiles);
    setPreviewImage(allFiles.map((file) => URL.createObjectURL(file)));
    setTrackKey(Date.now());
  };
  const HandleDeleteimg = (idx) => {
    URL.revokeObjectURL(previewImage[idx]);
    const updatedFiles = selectedFiles.filter((_, id) => id !== idx);
    const updated = previewImage.filter((_, id) => id !== idx);
    setSelectedFiles(updatedFiles);
    setPreviewImage(updated);
    setPreviewImage(allFiles.map((file) => URL.createObjectURL(file)));
  };

  const { data: variants } = useGetVariants(productId);
  const queryKey = useQueryClient();
  const { variantId } = useParams();
  const variant = variants?.find((item) => item._id === variantId);
  const { register, handleSubmit, reset } = useForm();
  const [existingImg, setExistingImg] = useState([]);
  const inputFields = [
    { field: "flavour", pl: "flavour" },
    { field: "size", pl: "Size label (e.g. 1kg, 500ml)" },
    { field: "oldPrice", pl: "Old Price" },
    { field: "salePrice", pl: "Sale Price" },
    { field: "stock", pl: "Stock count" },
  ];
  useEffect(() => {
    if (variant) {
      reset({
        flavour: variant?.flavour,
        size: variant?.size[0].label,
        oldPrice: variant?.size[0].oldPrice,
        salePrice: variant?.size[0].salePrice,
        stock: variant?.size[0].stock,
      });
      setExistingImg(variant?.images);
    }
  }, [variant, reset]);
  const HandleDelete = async (src) => {
    const wait = await confirm({
      message: "are you sure you want to remove these image",
    });
    if (wait) {
      setExistingImg((prev) => prev.filter((s) => s !== src));
      deleteImg(
        { variantId: variantId, src },
        {
          onSuccess: (data) => {
            queryKey.invalidateQueries(["variants"]);
            toast.message(`${data.message}`);
          },
        }
      );
    }
  };
  //submitting
  const onSubmit = (data) => {
    console.log(data);
    const size_Array = [
      {
        label: data.size,
        oldPrice: Number(data.oldPrice),
        salePrice: Number(data.salePrice),
        stock: Number(data.stock),
      },
    ];
    const formdata = new FormData();
    formdata.append("flavour", data.flavour);
    formdata.append("size", JSON.stringify(size_Array));
    selectedFiles.forEach((file) => formdata.append("images", file));
    editVariant(
      { variantId, formdata },
      {
        onSuccess: (data) => {
          toast.success(`${data.message}`);
          navigate(`/vendor/dashboard/variant/${productId}`);
        },
      }
    );
  };
  return (
    <div>
      <h1 className="capitalize text-purple-800 text-2xl font-semibold font-mono">
        Edit Variant
      </h1>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-purple-50 p-5">
        <div className="grid grid-cols-2 items-center mt-20 gap-10">
          {inputFields.map((inp, id) => (
            <input
              key={id}
              {...register(inp.field)}
              placeholder={inp.pl}
              className="border-b-2 border-purple-950 outline-0"
              autoComplete="off"
            />
          ))}
        </div>
        <div className="flex items-center justify-center mt-20 flex-col">
          {existingImg && existingImg.length > 0 && (
            <div className="flex items-center justify-evenly w-full">
              {existingImg.map((src, idx) => (
                <div key={idx} className="w-40 h-40">
                  <span onClick={() => HandleDelete(src)}>
                    <X className="w-4 h-4 text-pink-600 float-right" />
                  </span>
                  <img
                    src={`${PORT}${src}`}
                    alt="Image"
                    className="h-full w-full"
                  />
                </div>
              ))}
            </div>
          )}
          <div>
            <label
              htmlFor="images"
              className="flex flex-col items-center cursor-pointer bg-purple-600 text-white font-medium px-4 py-2 mt-20 rounded-lg hover:bg-purple-700 transition duration-200 w-fit"
            >
              <LucideCamera className="w-5 h-5" />
              add Images
            </label>
            <input
              id="images"
              key={trackKey}
              type="file"
              multiple
              accept="image/*"
              onChange={HandleImageChange}
              className="hidden"
            />
          </div>
          {previewImage && previewImage.length > 0 && (
            <div className="flex items-center justify-evenly">
              {previewImage.map((src, idx) => (
                <div key={idx} className="w-50 h-50">
                  <X
                    className="w-4 h-4 text-pink-600 float-right"
                    onClick={() => HandleDeleteimg(idx)}
                  />
                  <img
                    src={src}
                    alt="Image"
                    key={idx}
                    className="h-full w-full"
                  />
                </div>
              ))}
            </div>
          )}
          <div className="flex items-center justify-center w-full py-2 mt-10">
            <button className="border-2 border-purple-900 px-3 py-3 rounded-md bg-violet-600 uppercase text-white w-1/4 hover:bg-purple-900">
              Update variant
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default EditVariant;
