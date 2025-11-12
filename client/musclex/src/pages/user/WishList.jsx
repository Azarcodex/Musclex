import { Heart, IndianRupee, ShoppingCart, XSquareIcon } from "lucide-react";
import React from "react";
import Footer from "../../components/user/Footer";
import { usegetWishList } from "../../hooks/users/usegetWishList";
import { data, Link } from "react-router-dom";
import { useRemoveWishList } from "../../hooks/users/useRemoveWishList";
import { confirm } from "../../components/utils/Confirmation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

const WishList = () => {
  const { data: wishList } = usegetWishList();
  console.log(wishList?.wishList)
  const { mutate: Remove } = useRemoveWishList();
  const queryClient = useQueryClient();
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
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-7xl mx-auto px-8 py-12">
        {/* Title Section */}
        <div className="text-center mb-12">
          <Heart className="w-16 h-16 mx-auto mb-4 text-gray-900" />
          <h2 className="text-5xl font-bold text-purple-900 mb-8">
            My wishlist
          </h2>
        </div>

        {/* Back Link */}
        <Link
          to={"/user/products"}
          className="text-purple-600 hover:text-teal-700 text-sm mb-6 inline-block"
        >
          ← Back to home
        </Link>
        {wishList?.wishList.length > 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 bg-gray-50 px-6 py-4 border-b border-gray-200 font-semibold text-gray-900">
              <div className="col-span-1"></div>
              <div className="col-span-3">Product name(brand)</div>
              <div className="col-span-2">Unit price</div>
              <div className="col-span-2">category</div>
              <div className="col-span-2">Stock status</div>
              <div className="col-span-2">created</div>
            </div>

            {/* Table Body */}
            {wishList?.wishList.map((item) => (
              <div
                key={item._id}
                className="relative grid grid-cols-12 gap-4 px-6 py-6 border-b border-gray-200 items-center hover:bg-gray-50"
              >
                <span
                  onClick={() => HandleDelete(item._id)}
                  className="absolute right-0 top-1 hover:text-purple-500 hover:fill-purple-500 cursor-pointer"
                >
                  <XSquareIcon />
                </span>
                <div className="col-span-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300"
                  />
                </div>
                <div className="col-span-3 flex items-center gap-4">
                  <img
                    src={`${import.meta.env.VITE_API_URL}${
                      item.variantId?.images[0]
                    }`}
                    alt={item.name}
                    className="w-16 h-20 object-cover rounded"
                  />
                  <span className="font-medium text-gray-900">
                    {item.productId?.name}{" "}
                    <span className="text-sm text-purple-700">
                      ({item.productId?.brandID?.brand_name})
                    </span>
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-400 line-through mr-2 flex items-center gap-2">
                    <IndianRupee className="w-3 h-3" />
                    {item.variantId?.size[0].oldPrice}
                  </span>

                  <span className=" text-teal-600 font-semibold flex items-center gap-2">
                    <IndianRupee className="w-3 h-3" />
                    {item.variantId?.size[0].salePrice}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-900">
                    {item.productId?.catgid?.catgName}
                  </span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-900">{item.variantId?.size[0].stock}</span>
                </div>
                <div className="col-span-2 text-right">
                  <div className="text-xs text-gray-500 mb-2">
                    Added: {formatDate(item.createdAt)}
                  </div>
                  <button
                    className={`px-6 py-2 rounded font-medium text-sm bg-violet-600 text-white flex items-center gap-3`}
                  >
                    Add to Cart
                    <ShoppingCart className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <h2>No added products</h2>
        )}
        {/* Wishlist Table */}

        {/* Bottom Actions */}
        {/* <div className="flex items-center justify-between mt-6">
          <div className="flex items-center gap-4">
            <span className="text-gray-700">Apply this action to all the selected items:</span>
            <select className="border border-gray-300 rounded px-4 py-2 text-gray-700">
              <option>Add to cart</option>
            </select>
            <button className="bg-white border-2 border-teal-600 text-teal-600 px-8 py-2 rounded font-medium hover:bg-teal-50">
              APPLY
            </button>
          </div>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-8 py-3 rounded font-medium">
            ADD ALL TO CART
          </button>
        </div> */}

        {/* Share Section */}
        {/* <div className="mt-8">
          <span className="text-gray-700 font-medium mr-4">Share on:</span>
          <div className="inline-flex items-center gap-4">
            <button className="text-gray-600 hover:text-gray-900">
              <Facebook className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <Twitter className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <Share2 className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <Mail className="w-5 h-5" />
            </button>
            <button className="text-gray-600 hover:text-gray-900">
              <MessageCircle className="w-5 h-5" />
            </button>
          </div>
        </div> */}
      </main>
      <Footer />
    </div>
  );
};

export default WishList;
