import { buttonBaseClasses } from "@mui/material";
import { DollarSign, Star, ShoppingCart, Zap } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAddToCart } from "../../hooks/users/useAddCart";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const ProductListCard = ({ data }) => {
  const PORT = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const [currentVariant, setCurrentVariant] = useState(null);
  const [image, setImage] = useState("");
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [currentSize, setCurrentSize] = useState(null);
  const [selectedSizeIndex, setSelectedSizeindex] = useState(0);
  const { token } = useSelector((state) => state.userAuth);
  const { mutate: AddCart } = useAddToCart();
  // console.log(data);
  useEffect(() => {
    if (data?.variants?.length > 0) {
      const firstVariant = data.variants[0];
      setCurrentVariant(firstVariant);
      setSelectedVariantIndex(0);
      if (firstVariant?.size?.length > 0) {
        setCurrentSize(firstVariant?.size[0]);
        setSelectedSizeindex(0);
      }
    }
  }, [data]);
  // console.log("✅✅✅" + JSON.stringify(currentVariant));
  useEffect(() => {
    if (currentVariant?.images?.length > 0) {
      setImage(`${PORT}${currentVariant.images[0]}`);
    }
  }, [currentVariant, PORT]);
  // console.log(currentVariant);
  const handleVariantChange = (variant, index) => {
    setCurrentVariant(variant);
    setSelectedVariantIndex(index);
    if (variant?.size?.length > 0) {
      setCurrentSize(variant?.size[0]);
      setSelectedSizeindex(0);
    }
    if (variant?.images?.length > 0) {
      setImage(`${PORT}${variant.images[0]}`);
    }
  };
  const HandleSizeChange = (size, index) => {
    setCurrentSize(size);
    setSelectedSizeindex(index);
  };
  const discountPercentage =
    currentSize && currentSize.oldPrice > 0
      ? Math.round(
          ((currentSize.oldPrice - currentSize.salePrice) /
            currentSize.oldPrice) *
            100
        )
      : 0;
  //handling cart
  const HandleAddToCart = () => {
    if (!token) {
      toast.message("please login to continue");
      return;
    }
    const payload = {
      variantId: currentVariant?._id,
      productId: data?.products?._id,
      sizeLabel: currentSize?.label,
      price: currentSize?.salePrice,
    };
    AddCart(payload, {
      onSuccess: (data) => {
        toast.success(`${data.message}`);
        queryClient.invalidateQueries(["cart"]);
      },
      onError: (err) => {
        toast.message(`${err.response.data.message}`);
      },
    });
  };
  return (
    <div className="max-w-3xl  mx-auto  rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      <div className="flex flex-col md:flex-row">
        {/* Image Section */}
        <div className="md:w-1/3 p-6 bg-gradient-to-br from-gray-50 to-gray-100">
          <div className="relative aspect-square rounded-md overflow-hidden bg-white shadow-md">
            {discountPercentage > 0 && (
              <div className="absolute top-0 left-[-1px] bg-purple-500 text-white px-1 py-0.5 rounded-lg text-[12px] font-bold z-10 shadow-md">
                {discountPercentage}% OFF
              </div>
            )}
            <img
              src={image}
              alt={data?.products?.name || "Product"}
              className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
            />
          </div>
          {currentVariant?.images?.length > 1 && (
            <div className="flex gap-2 mt-4 justify-center overflow-x-auto">
              {currentVariant.images.slice(0, 3).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setImage(`${PORT}${img}`)}
                  className={`w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                    image === `${PORT}${img}`
                      ? "border-purple-500 shadow-md"
                      : "border-gray-200 opacity-70 hover:opacity-100"
                  }`}
                >
                  <img
                    src={`${PORT}${img}`}
                    alt={`Thumbnail ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="md:w-1/2 p-6 flex flex-col">
          {/* Brand */}
          <div className="text-sm font-semibold text-purple-600 uppercase tracking-wider mb-2">
            {data?.products?.brandID?.brand_name || "Brand"}
          </div>

          {/* Product Name */}
          <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
            {data?.products?.name || "Product Name"}
          </h2>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, id) => (
                <Star
                  key={id}
                  className={`w-5 h-5 ${
                    id < (data?.products?.Avgrating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
              ))}
            </div>
            <span className="text-sm text-gray-600 font-medium">
              {data?.products?.Avgrating?.toFixed(1) || "0.0"}
            </span>
          </div>

          {/* Price */}
          {currentSize && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex items-baseline gap-3">
                <div className="flex items-center text-3xl font-bold text-gray-900">
                  <DollarSign className="w-6 h-6" />
                  {currentSize.salePrice}
                </div>
                {currentSize.oldPrice > currentSize.salePrice && (
                  <div className="flex items-center text-lg text-gray-400 line-through">
                    <DollarSign className="w-4 h-4" />
                    {currentSize.oldPrice}
                  </div>
                )}
              </div>
              {currentSize.oldPrice > currentSize.salePrice && (
                <p className="text-sm text-green-600 font-medium mt-1">
                  You save $
                  {(currentSize.oldPrice - currentSize.salePrice).toFixed(2)}!
                </p>
              )}
              <p
                className={`font-semibold underline ${
                  currentSize.stock <= 0 ? "text-red-700" : "text-purple-800"
                } text-xs`}
              >
                {currentSize.stock <= 0
                  ? "out of stock !!"
                  : currentSize.stock === 1
                  ? "only 1 avaialable !!"
                  : "in stock"}
              </p>
            </div>
          )}

          {/* Variants */}
          {data?.variants?.length > 0 && (
            <div className="mb-6">
              <label className="text-sm font-semibold text-gray-700 mb-2 block">
                Select Variant
              </label>
              <div className="flex flex-wrap gap-2">
                {data.variants.map((v, id) => (
                  <div key={id} className="flex flex-col gap-3">
                    <button
                      onClick={() => handleVariantChange(v, id)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedVariantIndex === id
                          ? "bg-purple-600 text-white shadow-md scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {v.flavour}
                    </button>
                    {/* <button
                      onClick={() => handleVariantChange(v, id)}
                      className={`px-1.5 py-0.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        selectedVariantIndex === id
                          ? "bg-purple-600 text-white shadow-md scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {v.size}
                    </button> */}
                  </div>
                ))}
              </div>
            </div>
          )}
          {currentVariant?.size?.length > 0 && (
            <div className="flex items-center gap-3">
              {currentVariant?.size?.map((curr, idx) => (
                <div className="flex items-center justify-start" key={idx}>
                  <button
                    onClick={() => HandleSizeChange(curr, idx)}
                    className={` text-sm px-2 py-0.5 text-white rounded-sm cursor-pointer ${
                      selectedSizeIndex === idx
                        ? "bg-pink-700"
                        : "bg-purple-700"
                    }`}
                  >
                    {curr.label}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-3 flex flex-col sm:flex-row gap-3">
            <button
              onClick={HandleAddToCart}
              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white font-semibold py-1.5 px-2 rounded-md transition-colors duration-200 text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <ShoppingCart className="w-4 h-4" />
              Add to Cart
            </button>
            <button
              onClick={() =>
                navigate("/user/checkout", {
                  state: {
                    buyNow: true,
                    productID: data?.products._id,
                    variantID: currentVariant,
                    quantity: 1,
                    price: currentSize?.salePrice,
                  },
                })
              }
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-1.5 px-2 rounded-lg text-sm transition-colors duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
            >
              <Zap className="w-4 h-4" />
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListCard;
