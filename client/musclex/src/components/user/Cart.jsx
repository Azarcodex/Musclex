import React from "react";
import { X, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useQuantityChange, useRemoveCart } from "../../hooks/users/useAddCart";
import { confirm } from "../utils/Confirmation";
import { useNavigate } from "react-router-dom";

export default function Cart({ cartData }) {
  const shipping = 0;
  const navigate=useNavigate()
  const total = cartData?.totalAmount + shipping;
  const { mutate: RemoveCart } = useRemoveCart();
  const { mutate: updateQuantity } = useQuantityChange();
  const HandleDelete = async (id) => {
    const wait = await confirm({ message: "do you want to remove from cart" });
    if (wait) {
      RemoveCart(id, {
        onSuccess: (data) => {
          toast.message(`${data.message}`);
        },
      });
    }
  };

  return (
    <div className="min-h-1/2 bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cart Items Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-xl font-semibold mb-2">Your Cart</h2>
              <p className="text-gray-500 text-sm mb-6">
                There are {cartData?.totalItems} products in your cart
              </p>

              <div className="space-y-6">
                {cartData?.items.map((item) => (
                  <div
                    key={item._id}
                    className="flex gap-4 pb-6 border-b last:border-b-0"
                  >
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.productName}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-gray-400 text-xs">No Image</span>
                      </div>
                    )}

                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-xs text-gray-500 mb-1 uppercase">
                            {item.brandName}
                          </p>
                          <h3 className="font-medium text-sm mb-1 capitalize">
                            {item.productName}
                          </h3>
                        </div>
                        <button
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                          onClick={() => HandleDelete(item._id)}
                        >
                          <X size={20} />
                        </button>
                      </div>

                      <p className="text-xs text-gray-600 mb-1 capitalize">
                        Flavour: {item.flavour}
                      </p>
                      <p className="text-xs text-gray-600 mb-3">
                        Size: {item.sizeLabel}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center border rounded-md">
                          <button
                            className="px-3 py-1 hover:bg-gray-100"
                            onClick={() =>
                              updateQuantity({ id: item._id, action: "dec" })
                            }
                          >
                            -
                          </button>
                          <span className="px-4 py-1 border-x">
                            {item.quantity}
                          </span>
                          <button
                            className="px-3 py-1 hover:bg-gray-100"
                            onClick={() =>
                              updateQuantity({ id: item._id, action: "inc" })
                            }
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <p className="font-semibold">
                            ₹{item.price.toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            Total: ₹
                            {(item.price * item.quantity).toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Cart Summary Section */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-4">
              <h2 className="text-xl font-semibold mb-6">Cart Totals</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">
                    ₹{cartData?.totalAmount.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Shipping</span>
                  <span className="font-medium text-green-600">Free</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Estimated for</span>
                  <span className="font-medium">-</span>
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between text-sm mb-4">
                    <span className="text-gray-600">Total</span>
                    <span className="text-xl font-bold text-red-500">
                      ₹{total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              <button className="w-full bg-violet-500 hover:bg-red-600 text-white font-medium py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
              onClick={()=>navigate("/user/checkout")}>
                <ShoppingCart size={20} />
                CHECKOUT
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
