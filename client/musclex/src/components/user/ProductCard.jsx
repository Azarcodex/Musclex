import { ArrowBigRight, Heart, ShoppingCart, StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAddWishList } from "../../hooks/users/useAddWishList";
import { usegetWishList } from "../../hooks/users/usegetWishList";
import { useRemoveWishList } from "../../hooks/users/useRemoveWishList";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAddToCart, useGetCart } from "../../hooks/users/useAddCart";
import { toast } from "sonner";
import { useSelector } from "react-redux";

export default function ProductCard({ product }) {
  const navigate = useNavigate();
  const { mutate: addWishList } = useAddWishList();
  const { mutate: deleteWishList } = useRemoveWishList();
  const { mutate: addcart } = useAddToCart();
  const { data } = usegetWishList();
  const { data: getCart } = useGetCart();
  const [like, setLike] = useState(false);
  const queryClient = useQueryClient();
  const { token } = useSelector((state) => state.userAuth);

  const existItem = data?.wishList?.find(
    (item) =>
      String(item.productId?._id) === String(product?._id) &&
      String(item.variantId?._id) === String(product?.variants?._id)
  );

  useEffect(() => {
    if (data?.wishList) {
      const exist = data?.wishList?.some(
        (item) =>
          String(item.productId?._id) === String(product?._id) &&
          String(item.variantId?._id) === String(product?.variants?._id) &&
          item.sizeLabel === product?.size?.label
      );
      setLike(exist);
    }
  }, [data, product]);

  const HandleWishList = (productId, variantId, sizeLabel) => {
    if (!token) {
      toast.message("Please Login to continue");
      return;
    }
    if (!existItem) {
      addWishList(
        { productId: productId, variantId: variantId, sizeLabel: sizeLabel },
        {
          onSuccess: () => {
            setLike(true);
            queryClient.invalidateQueries(["wishList"]);
          },
        }
      );
    } else {
      deleteWishList(
        { id: existItem._id },
        {
          onSuccess: () => {
            setLike(false);
            queryClient.invalidateQueries(["wishList"]);
          },
        }
      );
    }
  };

  const HandleCart = (product) => {
    if (!token) {
      toast.message("Please Login to continue");
      return;
    }

    const isOffer = product.size.offerApplied;
    const priceToSend = isOffer
      ? product.size.finalPrice
      : product.size.salePrice;

    const payload = {
      variantId: product.variants._id,
      productId: product.variants.productId,
      sizeLabel: product.size.label,
      price: priceToSend,
    };

    addcart(payload, {
      onSuccess: (data) => {
        toast.success(`${data.message}`);
        queryClient.invalidateQueries(["cart"]);
      },
      onError: (err) => {
        toast.message(`${err.response.data.message}`);
      },
    });
  };

  let existCart;
  if (getCart?.items?.length > 0) {
    existCart = getCart?.items?.some(
      (item) =>
        String(item.productId) === product._id &&
        String(item.variantId) === product.variants._id &&
        String(item.sizeLabel) === product.size.label
    );
  }

  return (
    <div
      className="group relative w-60 border-2 border-white bg-white rounded-lg shadow-md overflow-hidden 
             hover:border-purple-950 hover:shadow-lg hover:scale-[1.02] 
             transition-all duration-300 ease-in-out flex flex-col"
    >
      <div
        title="view more"
        className="absolute top-1/2 right-0 translate-y-1 opacity-0 
               text-violet-600 border border-violet-950 rounded-sm px-1 py-0.5 text-sm cursor-pointer 
               group-hover:opacity-100 group-hover:translate-y-0 
                hover:text-white 
               transition-all duration-300 ease-in-out z-10"
        onClick={() => navigate(`/user/products/${product._id}`)}
      >
        <ArrowBigRight className="w-4 h-4 text-purple-600" />
      </div>

      {/* Image Container */}
      <div className="relative w-full h-40 p-4 flex items-center justify-center">
        <img
          src={product.prevImage}
          alt={product.name}
          className="w-full h-full object-contain"
        />

        {/* Discount Badge  */}
        {/* {!product.size.offerApplied && (
          <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
            {product.discount}%
          </div>
        )} */}

        {/* Heart Icon */}
        <button
          className="cursor-pointer absolute top-4 right-4 bg-white p-2 rounded-full hover:bg-gray-100"
          onClick={() =>
            HandleWishList(
              product._id,
              product.variants._id,
              product?.size?.label
            )
          }
        >
          <Heart
            className={`w-6 h-6 text-gray-700 ${
              like ? "text-red-800 fill-red-800" : ""
            }`}
          />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <p className="text-gray-600 text-sm">{product.brand}</p>

        <h3 className="text-gray-900 font-semibold mb-1">
          {product.name}
          <span className="text-[12px] text-purple-800">
            ({product?.size?.label})
          </span>
        </h3>

        <div className="h-12 mb-2">
          <p className="line-clamp-2 text-sm text-gray-600">
            {product.description}
          </p>
        </div>

        <div className="flex gap-1 mb-2">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-xl">
              {i < product.Avgrating ? (
                <StarIcon className="text-amber-300 w-4 h-4 fill-amber-300" />
              ) : (
                <StarIcon className="w-4 h-4 text-gray-300" />
              )}
            </span>
          ))}
        </div>

        {/* Price - Fixed Height Container */}
        <div className="mb-3 min-h-[120px] flex flex-col justify-start">
          {product.size.offerApplied ? (
            <div className="bg-gradient-to-br from-purple-50 to-emerald-50 border border-purple-200 rounded-lg p-3 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-xl font-bold text-purple-600">
                  ₹{product.size.finalPrice}
                </span>
                <span className="text-gray-400 line-through text-sm">
                  ₹{product.size.oldPrice}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-600">
                  ₹{product.size.salePrice}
                </span>
                <span className="bg-purple-600 text-white px-2 py-0.5 text-xs rounded-full font-bold shadow-sm">
                  {product.size.offerType === "percent"
                    ? `${product.size.offerValue}% OFF`
                    : `SAVE ₹${product.size.offerPrice}`}
                </span>
              </div>

              <div className="flex items-center gap-1 text-xs text-purple-700 font-medium">
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Special Offer!</span>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900">
                  ₹{product.size.salePrice}
                </span>
                <span className="text-gray-400 line-through text-sm">
                  ₹{product.size.oldPrice}
                </span>
              </div>
              {/* Define the logic constant for cleaner code */}
              {(() => {
                const stockCount = product?.size?.stock || 0;
                const inStock = stockCount > 0;

                return (
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                      inStock
                        ? "bg-red-50 text-red-700 border-red-200" // Urgency Style
                        : "bg-gray-100 text-gray-500 border-gray-200" // Disabled/Empty Style
                    }`}
                  >
                    {/* Icon */}
                    <svg
                      className={`w-3.5 h-3.5 ${!inStock && "opacity-50"}`} // Fade icon if out of stock
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z"
                        clipRule="evenodd"
                      />
                    </svg>

                    {/* Text */}
                    {inStock ? (
                      <span>Only {stockCount} left</span>
                    ) : (
                      <span>Out of stock</span>
                    )}
                  </div>
                );
              })()}
            </div>
          )}
        </div>

        {/* Add to Cart Button - Always at bottom */}
        <div className="mt-auto">
          <button
            onClick={() => HandleCart(product)}
            className="w-full border-2 border-red-500 text-red-500 py-2 rounded-md flex items-center justify-center gap-2 hover:bg-red-50 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            {!existCart ? (
              <span className="font-semibold text-sm">ADD TO CART</span>
            ) : (
              <span
                className="font-semibold text-sm text-green-600"
                onClick={() => navigate("/user/cart")}
              >
                SEE IN CART
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
