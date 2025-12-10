import {
  Heart,
  IndianRupee,
  ShoppingCart,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import React, { useState } from "react";
import Footer from "../../components/user/Footer";
import { usegetWishList } from "../../hooks/users/usegetWishList";
import { Link, useNavigate } from "react-router-dom";
import { useRemoveWishList } from "../../hooks/users/useRemoveWishList";
import { confirm } from "../../components/utils/Confirmation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import {
  useAddCartFromWishList,
  useGetCart,
} from "../../hooks/users/useAddCart";

const WishList = () => {
  const { data: wishList } = usegetWishList();
  const { mutate: Remove } = useRemoveWishList();
  const queryClient = useQueryClient();
  const { mutate: AddCart } = useAddCartFromWishList();
  const { data: getCart } = useGetCart();
  const navigate = useNavigate();

  const HandleDelete = async (id) => {
    const wait = await confirm({
      message: "Do you want to remove from wishlist",
    });
    if (wait) {
      Remove(
        { id: id },
        {
          onSuccess: (data) => {
            toast.message(data.message);
            queryClient.invalidateQueries(["wishList"]);
          },
        }
      );
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleAddToCart = (item) => {
    const selected = item?.variantId?.size?.find(
      (s) => s.label === item.sizeLabel
    );
    const payload = {
      variantId: item?.variantId?._id,
      productId: item?.productId._id,
      sizeLabel: item.sizeLabel,
      price: selected.finalPrice,
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-between">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Heart className="w-8 h-8 text-purple-600 fill-purple-600" />
              My Wishlist
            </h2>
            <p className="text-gray-500 mt-2">
              {wishList?.wishList.length || 0} items saved for later
            </p>
          </div>
          <Link
            to={"/user/products"}
            className="group flex items-center text-sm font-medium text-gray-600 hover:text-purple-600 transition-colors mt-4 md:mt-0"
          >
            <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
            Continue Shopping
          </Link>
        </div>

        {wishList?.wishList.length > 0 ? (
          <div className="space-y-4">
            {wishList?.wishList.map((item) => {
              const existInCart = getCart?.items?.some(
                (cartItem) =>
                  String(cartItem.productId) === String(item.productId._id) &&
                  String(cartItem.variantId) === String(item.variantId._id) &&
                  String(cartItem.sizeLabel) === String(item.sizeLabel)
              );
              const selectedSize = item.variantId?.size?.find(
                (x) => x.label === item.sizeLabel
              );

              return (
                <div
                  key={item._id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300"
                >
                  <div className="p-6 flex flex-col sm:flex-row items-start sm:items-center gap-6">
                    <div className="relative flex-shrink-0 w-full sm:w-32 h-32 bg-gray-100 rounded-lg overflow-hidden">
                      <img
                        src={`${import.meta.env.VITE_API_URL}${
                          item.variantId?.images[0]
                        }`}
                        alt={item.productId?.name}
                        className="w-full h-full object-cover object-center"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm text-purple-600 font-medium mb-1">
                              {item.productId?.brandID?.brand_name}
                            </p>
                            <h3 className="text-lg font-semibold text-gray-900 truncate">
                              {item.productId?.name}
                            </h3>
                            <p className="text-sm text-gray-500 mt-1">
                              Category: {item.productId?.catgid?.catgName}
                            </p>
                            <p className="text-sm text-gray-500 mt-1">
                              {item.sizeLabel}
                            </p>
                          </div>
                          <div className="text-right">
                            {item.variantId?.size[0].offerApplied ? (
                              <div className="flex flex-col items-end">
                                <span className="text-xl font-bold text-gray-900 flex items-center">
                                  <IndianRupee className="w-4 h-4" />
                                  {selectedSize.finalPrice}
                                </span>
                                <span className="text-sm text-gray-400 line-through flex items-center">
                                  <IndianRupee className="w-3 h-3" />
                                  {selectedSize.salePrice}
                                </span>
                              </div>
                            ) : (
                              <span className="text-xl font-bold text-gray-900 flex items-center">
                                <IndianRupee className="w-4 h-4" />
                                {selectedSize.salePrice}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-gray-100">
                          <div className="text-xs text-gray-400">
                            Added on {formatDate(item.createdAt)}
                          </div>
                          <div className="flex items-center w-full sm:w-auto gap-3">
                            <button
                              onClick={() => HandleDelete(item._id)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                              Remove
                            </button>
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg text-sm font-medium hover:bg-purple-700 shadow-sm hover:shadow transition-all"
                            >
                              <ShoppingCart className="w-4 h-4" />
                              {!existInCart ? (
                                <span className="font-semibold text-sm">
                                  ADD TO CART
                                </span>
                              ) : (
                                <span
                                  className="font-semibold text-sm text-orange-300 cursor-pointer"
                                  onClick={() => navigate("/user/cart")}
                                >
                                  SEE IN CART
                                </span>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-300">
            <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
              <Heart className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Your wishlist is empty
            </h3>
            <p className="text-gray-500 mb-8 max-w-sm mx-auto">
              Looks like you haven't added anything to your wishlist yet.
              Explore our products and save your favorites.
            </p>
            <Link
              to="/user/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default WishList;
