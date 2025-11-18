import { ArrowBigRight, Heart, ShoppingCart, StarIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAddWishList } from "../../hooks/users/useAddWishList";
import { usegetWishList } from "../../hooks/users/usegetWishList";
import { useRemoveWishList } from "../../hooks/users/useRemoveWishList";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { userAuthStore } from "../../hooks/users/zustand/useAuth";
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
  console.log(data);
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
          String(item.variantId?._id) === String(product?.variants?._id)
      );
      setLike(exist);
    }
  }, [data, product]);

  const HandleWishList = (product, variant) => {
    if (!token) {
      toast.message("Please Login to continue");
      return;
    }
    if (!existItem) {
      addWishList(
        { productId: product, variantId: variant },
        {
          onSuccess: () => {
            console.log("liked");
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
            console.log("disliked");
            setLike(false);
            queryClient.invalidateQueries(["wishList"]);
          },
        }
      );
    }
  };
  //cart management
  const HandleCart = (product) => {
    if (!token) {
      toast.message("Please Login to continue");
      return;
    }
    const payload = {
      variantId: product.variants._id,
      productId: product.variants.productId,
      sizeLabel: product.size.label,
      price: product.size.salePrice,
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
             transition-all duration-300 ease-in-out"
    >
      <div
        title="view more"
        className="absolute top-1/2 right-0 translate-y-1 opacity-0 
               text-violet-600 border border-violet-950 rounded-sm px-1 py-0.5 text-sm cursor-pointer 
               group-hover:opacity-100 group-hover:translate-y-0 
                hover:text-white 
               transition-all duration-300 ease-in-out"
        onClick={() => navigate(`/user/products/${product._id}`)}
      >
        <ArrowBigRight className="w-4 h-4 text-purple-600 hover:scale-3d hover:fill-purple-600" />
      </div>
      {/* Image Container */}
      <div className="relative w-full h-40 p-4 flex items-center justify-center ">
        <img
          src={product.prevImage}
          alt={product.name}
          className="w-full h-full object-contain"
        />

        {/* Discount Badge */}
        <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {product.discount}%
        </div>

        {/* Heart Icon */}
        <button
          className="cursor-pointer absolute top-4 right-4 bg-white p-2 rounded-full hover:bg-gray-100"
          onClick={() => HandleWishList(product._id, product.variants._id)}
        >
          <Heart
            className={`w-6 h-6 text-gray-700 ${
              like ? "text-red-800 fill-red-800" : ""
            }`}
          />
        </button>
      </div>
      {/* Content */}
      <div className="p-4 ">
        {/* Brand */}
        <p className="text-gray-600 text-sm">{product.brand}</p>

        {/* Product Name */}
        <h3 className="text-gray-900 font-semibold mb-1">
          {product.name}
          <span className="text-[12px] text-purple-800">
            ({product?.size?.label})
          </span>
        </h3>
        <div className="h-20">
          <p className="line-clamp-2">{product.description}</p>
        </div>
        {/* Rating */}
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <span key={i} className="text-xl">
              {i < product.Avgrating ? (
                <StarIcon className="text-amber-300 w-4 h-4" />
              ) : (
                <StarIcon className="w-4 h-4" />
              )}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="flex items-center gap-3 mb-1 justify-between">
          <span className="text-gray-400 line-through text-sm">
            ₹{product?.size?.oldPrice}
          </span>
          <span className="text-red-500 text-xl font-bold">
            ₹{product?.size?.salePrice}
          </span>
        </div>

        {/* Add to Cart Button */}
        <button className="w-full border-2 border-red-500 text-red-500 py-1 rounded-md flex items-center justify-center gap-2 hover:bg-red-50 transition-colors">
          <ShoppingCart className="w-3 h-3" />
          {!existCart ? (
            <span
              className="font-semibold text-sm"
              onClick={() => HandleCart(product)}
            >
              ADD TO CART
            </span>
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
  );
}
