import React from "react";
import { useParams, Link } from "react-router-dom";
import { useGetVariants } from "../../hooks/vendor/useGetVariant";

const VariantList = () => {
  const { productId } = useParams();
  const { data: variants, isLoading, isError } = useGetVariants(productId);
  console.log(JSON.stringify(variants));
  if (isLoading) return <p className="text-center mt-8">Loading variants...</p>;
  if (isError)
    return (
      <p className="text-center text-red-500 mt-8">Failed to load variants.</p>
    );

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">Variants</h2>
        <Link
          to={`/vendor/add-variant/${productId}`}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
        >
          + Add Variant
        </Link>
      </div>

      {variants?.length === 0 ? (
        <p className="text-gray-500 text-center">No variants added yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {variants?.map((variant) => (
            <div
              key={variant._id}
              className="border rounded-lg p-4 shadow-sm bg-white"
            >
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

              <div className="mt-3 space-y-1">
                {variant.color && (
                  <p>
                    <strong>Color:</strong> {variant.color}
                  </p>
                )}
                {variant.size && (
                  <p>
                    <strong>Size:</strong> {variant.size}
                  </p>
                )}
                {variant.flavour && (
                  <p>
                    <strong>Flavour:</strong> {variant.flavour}
                  </p>
                )}
                <p>
                  <strong>Old Price:</strong> ₹{variant.oldPrice}
                </p>
                <p>
                  <strong>Sale Price:</strong> ₹{variant.salePrice}
                </p>
                <p>
                  <strong>Stock:</strong> {variant.stock}
                </p>
                <p>
                  <strong>Offer:</strong>{" "}
                  {variant.isOnOffer ? (
                    <span className="text-green-600 font-medium">Yes</span>
                  ) : (
                    <span className="text-gray-500">No</span>
                  )}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default VariantList;
