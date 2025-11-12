import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { useAddVariant } from "../../hooks/vendor/useAddVariant";
import { useRelatedVariantProduct } from "../../hooks/vendor/useRelatedVariantProcuct";
import { Camera, LucideCamera, X } from "lucide-react";

const VariantForm = () => {
  const { productId } = useParams();
  const { data: productList } = useRelatedVariantProduct(productId);
  console.log(productList?.product);
  const { register, handleSubmit, reset } = useForm();
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImage, setPreviewImage] = useState([]);
  const { mutate } = useAddVariant();
  const HandleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const allFiles = [...selectedFiles, ...files];
    console.log(allFiles);
    setSelectedFiles(allFiles);
    setPreviewImage(allFiles.map((file) => URL.createObjectURL(file)));
  };
  const onSubmit = (data) => {
    if (selectedFiles.length < 3) {
      toast.message("pls add three images");
      return;
    }
    const formdata = new FormData();
    const size_Array = [
      {
        label: data.size,
        oldPrice: Number(data.oldPrice),
        salePrice: Number(data.salePrice),
        stock: Number(data.stock),
      },
    ];
    formdata.append("productId", productId);
    formdata.append("flavour", data.flavour);
    formdata.append("sku", data.sku);
    formdata.append("size", JSON.stringify(size_Array));
    selectedFiles.forEach((file) => formdata.append("images", file));
    mutate(formdata, {
      onSuccess: (data) => {
        console.log(data);
        toast.success(`${data.message}`);
        setPreviewImage([]);
        reset();
      },
      onError: (err) => {
        toast.error(`${err.response.data.message}`);
      },
    });
  };
  // Create sizes array from form data
  // const sizesArray = [
  //   {
  //     label: data.size,
  //     oldPrice: Number(data.oldPrice),
  //     salePrice: Number(data.salePrice),
  //     stock: Number(data.stock),
  //   },
  // ];

  // // Build formData correctly for backend
  // formdata.append("productId", productId);
  // formdata.append("flavour", data.flavour);
  // formdata.append("sizes", JSON.stringify(sizesArray)); // <-- Important change
  // selectedFiles.forEach((file) => formdata.append("images", file));

  const HandleDeleteImg = (idx) => {
    const updatedFiles = selectedFiles.filter((_, id) => id !== idx);
    const updatePreview = previewImage.filter((_, id) => id !== idx);
    setSelectedFiles(updatedFiles);
    setPreviewImage(updatePreview);
  };
  const inputFields = [
    { field: "flavour", pl: "flavour" },
    { field: "size", pl: "Size label (e.g. 1kg, 500ml)" },
    { field: "oldPrice", pl: "Old Price" },
    { field: "salePrice", pl: "Sale Price" },
    { field: "stock", pl: "Stock count" },
    { field: "sku", pl: "sku(Eg:CHOC-1KG-4821)" },
  ];

  return (
    <div>
      <form onSubmit={handleSubmit(onSubmit)} className="bg-purple-50 p-5">
        <div className="bg-white text-pink-700 font-bold flex items-center justify-evenly text-sm p-2 border-b-2 border-violet-600">
          <h1 className="text-purple-950 font-bolder text-2xl">
            Product Details:
          </h1>
          <h4>
            <span className="text-purple-600 font-semibold">product_name:</span>{" "}
            {productList?.product.name}
          </h4>

          <h4>
            <span className="text-purple-600 font-semibold">category:</span>{" "}
            {productList?.product.catgid?.catgName}
          </h4>

          <h4>
            <span className="text-purple-600 font-semibold">Brand:</span>{" "}
            {productList?.product.brandID?.brand_name}
          </h4>

          <h4>
            <span className="text-purple-600 font-semibold">total Stock:</span>{" "}
            {productList?.product.totalStock}
          </h4>
        </div>
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
        <div className="flex items-center justify-center mt-20">
          <label
            htmlFor="images"
            className="flex flex-col items-center cursor-pointer bg-purple-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-purple-700 transition duration-200 w-fit"
          >
            <LucideCamera className="w-5 h-5" />
            Choose Images
          </label>
          <input
            id="images"
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
                  onClick={() => HandleDeleteImg(idx)}
                />
                <img src={src} alt="Image" className="h-full w-full" />
              </div>
            ))}
          </div>
        )}
        <div className="flex items-center justify-center w-full py-2 mt-10">
          <button className="border-2 border-purple-900 px-3 py-3 rounded-md bg-violet-600 uppercase text-white w-1/4 hover:bg-purple-900">
            add variant
          </button>
        </div>
      </form>
    </div>
  );
};

export default VariantForm;
