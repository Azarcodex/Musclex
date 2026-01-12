import {
  DollarSign,
  Star,
  ShoppingCart,
  Zap,
  Package,
  Tag,
  HeartIcon,
  Heart,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { useAddToCart } from "../../hooks/users/useAddCart";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useAddWishList } from "../../hooks/users/useAddWishList";
import { usegetWishList } from "../../hooks/users/usegetWishList";
import { useRemoveWishList } from "../../hooks/users/useRemoveWishList";

export default function ProductListCard({ data }) {
  const PORT = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { mutate: addWishList } = useAddWishList();
  const { mutate: deleteWishList } = useRemoveWishList();
  const { data: wishList } = usegetWishList();
  const [currentVariant, setCurrentVariant] = useState(null);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [like, setLike] = useState(false);
  const [currentSize, setCurrentSize] = useState(null);
  const [selectedSizeIndex, setSelectedSizeIndex] = useState(0);

  const [image, setImage] = useState("");

  const { token } = useSelector((state) => state.userAuth);
  const { mutate: AddCart } = useAddToCart();

  useEffect(() => {
    if (data?.variants?.length > 0) {
      const v = data.variants[0];
      setCurrentVariant(v);
      setSelectedVariantIndex(0);

      if (v.size?.length > 0) {
        setCurrentSize(v.size[0]);
        setSelectedSizeIndex(0);
      }
    }
  }, [data]);

  useEffect(() => {
    if (currentVariant?.images?.length > 0) {
      setImage(`/uploads/${currentVariant.images[0]}`);
    }
  }, [currentVariant]);

  const handleVariantChange = (variant, index) => {
    setCurrentVariant(variant);
    setSelectedVariantIndex(index);

    if (variant.size?.length > 0) {
      setCurrentSize(variant.size[0]);
      setSelectedSizeIndex(0);
    }

    if (variant.images?.length > 0) {
      setImage(`${variant.images[0]}`);
    }
  };

  const handleSizeChange = (size, index) => {
    setCurrentSize(size);
    setSelectedSizeIndex(index);
  };

  const discountPercentage =
    currentSize && currentSize.oldPrice > 0
      ? Math.round(
          ((currentSize.oldPrice - currentSize.salePrice) /
            currentSize.oldPrice) *
            100
        )
      : 0;

  const offerApplied = currentSize?.offerApplied === true;
  const finalPrice = offerApplied
    ? currentSize.finalPrice
    : currentSize?.salePrice;

  const handleAddToCart = () => {
    if (!token) {
      toast.message("Please login to continue");
      return;
    }

    const payload = {
      variantId: currentVariant?._id,
      productId: data?.product?._id,
      sizeLabel: currentSize?.label,
      price: finalPrice,
    };

    AddCart(payload, {
      onSuccess: (res) => {
        toast.success(res.message);
        queryClient.invalidateQueries(["cart"]);
      },
      onError: (err) => {
        toast.error(err.response.data.message);
      },
    });
  };
  // // buynow
  // const handleBuyNow = () => {
  //   if (currentSize?.stock === 0) {
  //     toast.message("Stock Unavailable");
  //     return;
  //   }
  //   navigate("/user/checkout", {
  //     state: {
  //       buyNow: true,
  //       productID: data?.product,
  //       variantID: currentVariant,
  //       quantity: 1,
  //       price: finalPrice,
  //       sizeLabel: currentSize?.label,
  //     },
  //   });
  // };

  const HandleWishList = (productId, variantId, sizeLabel) => {
    if (!token) {
      toast.message("Please Login to continue");
      return;
    }
    addWishList(
      { productId: productId, variantId: variantId, sizeLabel: sizeLabel },
      {
        onSuccess: () => {
          queryClient.invalidateQueries(["wishList"]);
          toast.success("addes to wishList");
        },
      }
    );
  };

  return (
    <div className="max-w-5xl mx-auto rounded-2xl overflow-hidden bg-white hover:shadow-2xl transition-all duration-500 border border-gray-100 shadow-lg">
      <div className="flex flex-col lg:flex-row">
        {/* Image Section */}
        <div className="lg:w-2/5 p-8 bg-gradient-to-br from-purple-50 via-white to-pink-50 relative">
          {/* Badges Container */}
          <div className="absolute top-6 left-6 right-6 flex justify-between items-start z-10">
            {discountPercentage > 0 && (
              <div className="bg-gradient-to-r from-purple-600 to-purple-700 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg flex items-center gap-1">
                <Tag className="w-3 h-3" />
                {discountPercentage}% OFF
              </div>
            )}

            {offerApplied && (
              <div className="bg-gradient-to-r from-red-600 to-rose-600 text-white px-2 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                Extra {currentSize.offerValue}
                {currentSize.offerType === "percent" ? "%" : "₹"} OFF
              </div>
            )}
          </div>

          {/* Main Image */}
          <div className="relative mt-4">
            <img
              src={image}
              alt="product"
              className="w-full h-60 object-cover rounded-2xl shadow-xl border-4 border-white"
            />
          </div>

          {/* Thumbnail Images */}
          <div className="flex gap-3 mt-6 justify-center">
            {currentVariant?.images?.map((img, i) => (
              <div
                key={i}
                onClick={() => setImage(`/uploads/${img}`)}
                className={`relative cursor-pointer transition-all duration-300 ${
                  image === `${PORT}${img}`
                    ? "scale-110"
                    : "opacity-60 hover:opacity-100"
                }`}
              >
                <img
                  src={`/uploads/${img}`}
                  className={`w-20 h-20 rounded-xl object-cover border-2 ${
                    image === `${PORT}${img}`
                      ? "border-purple-600 shadow-lg"
                      : "border-gray-200"
                  }`}
                />
                {image === `${PORT}${img}` && (
                  <div className="absolute inset-0 rounded-xl border-2 border-purple-600 bg-purple-600/10"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Content Section */}
        <div className="lg:w-3/5 p-8 flex flex-col bg-gradient-to-br from-white to-gray-50">
          {/* Brand */}
          <div className="flex items-center justify-between">
            <div className="inline-flex items-center gap-2 mb-3">
              <Package className="w-4 h-4 text-purple-600" />
              <h3 className="text-sm font-bold text-purple-700 uppercase tracking-wide">
                {data?.product?.brandID?.brand_name}
              </h3>
            </div>
          </div>
          {/* Product Name */}
          <h1 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
            {data?.product?.name}
          </h1>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-6 bg-white rounded-full px-2 py-1 w-fit shadow-sm border border-gray-100">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, id) => (
                <Star
                  key={id}
                  className={`w-4 h-4 ${
                    id < (data?.product?.Avgrating || 0)
                      ? "text-amber-400 fill-amber-400"
                      : "text-gray-300 fill-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-gray-700 text-sm font-semibold">
              {data?.product?.Avgrating?.toFixed(1)}
            </span>
          </div>

          {/* Price Section */}
          {currentSize && (
            <div className="mb-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-2xl p-5 border border-purple-100">
              <div className="flex items-center gap-4 mb-2">
                <div className="flex items-baseline text-lg font-black text-purple-900">
                  <span className="text-sm mr-1">₹</span>
                  {finalPrice}
                </div>

                {currentSize.oldPrice > finalPrice && (
                  <div className="flex items-baseline text-gray-400 line-through text-xs">
                    <span className="text-xs mr-0.5">₹</span>
                    {currentSize.oldPrice}
                  </div>
                )}

                {currentSize.oldPrice > finalPrice && (
                  <div className="bg-green-100 text-green-700 px-1 py-1 rounded-full text-xs font-bold">
                    You Save ₹{currentSize.oldPrice - finalPrice}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div
                  className={`h-2 w-2 rounded-full ${
                    currentSize.stock <= 0
                      ? "bg-red-500"
                      : currentSize.stock <= 5
                      ? "bg-amber-500"
                      : "bg-green-500"
                  } animate-pulse`}
                ></div>
                <p
                  className={`text-sm font-bold ${
                    currentSize.stock <= 0
                      ? "text-red-700"
                      : currentSize.stock <= 5
                      ? "text-amber-700"
                      : "text-green-700"
                  }`}
                >
                  {currentSize.stock <= 0
                    ? "Out of stock"
                    : currentSize.stock === 1
                    ? "Only 1 left - Order now!"
                    : currentSize.stock <= 5
                    ? `Only ${currentSize.stock} left in stock`
                    : "In stock"}
                </p>
              </div>
            </div>
          )}

          {/* Variant Selection */}
          <div className="mb-6">
            {/* <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Select Variant
            </h3> */}
            <div className="flex flex-wrap gap-3">
              {data?.variants
                ?.filter((v) => v?.flavour && v.flavour.trim() !== "")
                .map((v, id) => (
                  <button
                    key={id}
                    onClick={() => handleVariantChange(v, id)}
                    className={`px-2 py-1 rounded-xl text-sm font-semibold transition-all duration-300 ${
                      selectedVariantIndex === id
                        ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-lg transform scale-105"
                        : "bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300 hover:shadow-md"
                    }`}
                  >
                    {v.flavour}
                  </button>
                ))}
            </div>
          </div>

          {/* Size Selection */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
              Select Size
            </h3>
            <div className="flex flex-wrap gap-3">
              {currentVariant?.size?.map((s, id) => (
                <button
                  key={id}
                  onClick={() => handleSizeChange(s, id)}
                  className={`px-2 py-1 rounded-lg text-sm font-bold transition-all duration-300 ${
                    selectedSizeIndex === id
                      ? "bg-gradient-to-r from-purple-600 to-purple-700 text-white shadow-md transform scale-105"
                      : "bg-purple-100 text-purple-900 hover:bg-purple-200"
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-auto">
            <button
              onClick={handleAddToCart}
              className="flex-1 bg-gradient-to-r from-purple-600 to-purple-700 text-white py-2 rounded-xl flex items-center justify-center gap-3 text-xs font-bold hover:from-purple-700 hover:to-purple-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <ShoppingCart className="w-3 h-3" />
              Add to Cart
            </button>
            <button
              onClick={() =>
                HandleWishList(
                  data?.product._id,
                  currentVariant._id,
                  currentSize.label
                )
              }
              className="flex-1 bg-gradient-to-r from-rose-600 to-pink-600 text-white py-2 rounded-xl flex items-center justify-center gap-2 text-xs font-bold hover:from-rose-700 hover:to-pink-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              <Heart size={12} strokeWidth={3} />
              add to WishList
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
