import React from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useGetVariants } from "../../hooks/vendor/useGetVariant";
import { PenSquare } from "lucide-react";

const VariantList = () => {
  const navigate = useNavigate();
  const { productId } = useParams();
  const { data: variants, isLoading, isError } = useGetVariants(productId);
  console.log(variants);
  if (isLoading) return <p className="text-center mt-8">Loading variants...</p>;
  if (isError)
    return (
      <p className="text-center text-red-500 mt-8">Failed to load variants.</p>
    );
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

      {variants?.length === 0 ? (
        <p className="text-gray-500 text-center">No variants added yet.</p>
      ) : (
        <div className=" grid grid-cols-1 md:grid-cols-3 gap-6 p-5">
          {variants?.map((variant) => (
            <div
              key={variant._id}
              className="relative border-2 border-purple-900 rounded-md p-4 shadow-sm bg-white"
            >
              <span
                className="absolute top-1 right-2 text-purple-700"
                onClick={() => navigate(`/vendor/dashboard/variant/${productId}/edit/${variant._id}`)}
              >
                <PenSquare className="w-5 h-5 cursor-pointer hover:w-6" />
              </span>
              <div className="flex gap-2 overflow-x-auto">
                {variant.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={`${import.meta.env.VITE_API_URL}${img}`}
                    alt="Variant"
                    className="w-20 h-20 rounded-md object-cover border"
                  />
                ))}
              </div>

              <div className="mt-3 space-y-1 bg-purple-50 border-1 border-black p-0.5 rounded-sm mx-auto">
                <p className="flex items-center gap-2">
                  <span className="text-violet-700 font-mono text-sm">
                    Flavour:
                  </span>
                  <span className="font-semibold text-blue-500 text-[13px]">
                    {variant.flavour}
                  </span>
                </p>
                {variant?.size?.map((data, id) => (
                  <div>
                    <p className="flex items-center gap-2">
                      <span className="text-violet-700 font-mono text-sm">
                        Size:
                      </span>
                      <span className="font-semibold text-blue-500 text-[13px]">
                        {data.label}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-violet-700 font-mono text-sm">
                        oldPrice:
                      </span>
                      <span className="font-semibold text-blue-500 text-[13px]">
                        ${data.oldPrice}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-violet-700 font-mono text-sm">
                        salePrice:
                      </span>
                      <span className="font-semibold text-blue-500 text-[13px]">
                        ${data.salePrice}
                      </span>
                    </p>
                    <p className="flex items-center gap-2">
                      <span className="text-violet-700 font-mono text-sm">
                        stock:
                      </span>
                      <span className="font-semibold text-blue-500 text-[13px]">
                        {data.stock}
                      </span>
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariantList;
