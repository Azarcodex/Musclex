import React, { useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetVariants } from "../../hooks/vendor/useGetVariant";
import { PenSquare, Trash } from "lucide-react";

const VariantList = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { data: variants = [], isLoading, isError } = useGetVariants(productId);

  if (isLoading) return <p className="text-center mt-8">Loading variants...</p>;
  if (isError)
    return (
      <p className="text-center text-red-500 mt-8">Failed to load variants.</p>
    );

  const HandleVariantDelete = (id) => {
    console.log("delete variant", id);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Variants</h2>
        <Link
          to={`/vendor/dashboard/variant/add/${productId}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Variant
        </Link>
      </div>

      {variants.length === 0 ? (
        <p className="text-gray-500 text-center">No variants added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
          {variants.map((variant) => (
            <div
              key={variant._id}
              className="relative border-2 border-purple-900 rounded-md p-4 shadow-sm bg-white"
            >
              {/* Edit & Delete */}
              <span
                className="absolute top-1 right-2 text-purple-700"
                onClick={() =>
                  navigate(
                    `/vendor/dashboard/variant/${productId}/edit/${variant._id}`
                  )
                }
              >
                <PenSquare className="w-5 h-5 cursor-pointer hover:w-6" />
              </span>
              <span
                className="absolute right-1.5 top-10 text-purple-700"
                onClick={() => HandleVariantDelete(variant._id)}
              >
                <Trash className="w-5 h-5 cursor-pointer hover:w-6" />
              </span>

              {/* Images */}
              <div className="flex gap-2 overflow-x-auto mb-3">
                {variant.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={`${import.meta.env.VITE_API_URL}${img}`}
                    alt="Variant"
                    className="w-20 h-20 rounded-md object-cover border"
                  />
                ))}
              </div>

              {/* Flavour */}
              <div className="bg-purple-50 border p-2 rounded-sm">
                <p className="flex items-center gap-2 mb-2">
                  <span className="text-violet-700 font-mono text-sm">
                    Flavour:
                  </span>
                  <span className="font-semibold text-blue-500 text-[13px]">
                    {variant.flavour}
                  </span>
                </p>

                {/* ✅ Size Component */}
                <SizeCard variant={variant} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// 🧩 SizeCard component
const SizeCard = ({ variant }) => {
  const [sizeIndex, setSizeIndex] = useState(0);
  const sizes = variant.size || [];

  const handlePrev = () => {
    if (sizeIndex > 0) setSizeIndex((prev) => prev - 1);
  };

  const handleNext = () => {
    if (sizeIndex < sizes.length - 1) setSizeIndex((prev) => prev + 1);
  };

  const data = sizes[sizeIndex];
  if (!data) return <p className="text-gray-400">No size info</p>;

  return (
    <div>
      <p className="flex items-center gap-2">
        <span className="text-violet-700 font-mono text-sm">Size:</span>
        <span className="font-semibold text-blue-500 text-[13px]">
          {data.label}
        </span>
      </p>
      <p className="flex items-center gap-2">
        <span className="text-violet-700 font-mono text-sm">Old Price:</span>
        <span className="font-semibold text-blue-500 text-[13px]">
          ₹{data.oldPrice}
        </span>
      </p>
      <p className="flex items-center gap-2">
        <span className="text-violet-700 font-mono text-sm">Sale Price:</span>
        <span className="font-semibold text-blue-500 text-[13px]">
          ₹{data.salePrice}
        </span>
      </p>
      <p className="flex items-center gap-2">
        <span className="text-violet-700 font-mono text-sm">Stock</span>
        <span className="font-semibold text-blue-500 text-[13px]">
          {data.stock}
        </span>
      </p>

      <div className="flex items-center justify-between mt-2">
        <button
          onClick={handlePrev}
          disabled={sizeIndex === 0}
          className="text-white bg-purple-700 px-2 py-0.5 rounded disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-gray-600 text-sm">
          {sizeIndex + 1} / {sizes.length}
        </span>
        <button
          onClick={handleNext}
          disabled={sizeIndex === sizes.length - 1}
          className="text-white bg-purple-700 px-2 py-0.5 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default VariantList;
