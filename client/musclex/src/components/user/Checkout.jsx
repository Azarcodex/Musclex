import React, { useEffect, useState, useRef } from "react";
import { MapPin, Plus, CreditCard, Wallet, ShoppingBag } from "lucide-react";
import { useGetCheckout } from "../../hooks/users/useGetCheckout";
import { useOrder } from "../../hooks/users/useOrder";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";
import Modal from "react-modal";
import {
  useApplyCoupon,
  usegetAvailableCoupons,
} from "../../hooks/users/useCoupon";
import CouponList from "./CouponList";
import {
  useCreateRazorpayOrder,
  useVerifyRazorpayPayment,
} from "../../hooks/payment/razorpayHook";

export default function Checkout() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const isBuyNow = state?.buyNow === true;
  //coupons
  const [isOpen, setIsOpen] = useState(false);
  const { data: coupons } = usegetAvailableCoupons();
  //---------
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [couponCode, setCouponCode] = useState("");
  const [passcoupon, setPassCoupon] = useState(null);
  const [discount, setDiscount] = useState(0);
  const [finalTotal, setFinalTotal] = useState(0);

  const { data: checkoutItems, isLoading } = useGetCheckout();
  // console.log(checkoutItems);
  // console.log(checkoutItems?.canPlaceOrder);

  const { mutate: placeOrder, isLoading: placingOrder } = useOrder();
  const { mutate: applyCouponFn, isLoading: applyingCoupon } = useApplyCoupon();

  //disbaling logic

  const COD_LIMIT = checkoutItems?.orderLimit ?? 1000;

  const isCODAllowed = finalTotal <= COD_LIMIT;

  // const isDisabled = placingOrder || !canPlaceOrderFinal;
  // const disabledTitle = !canPlaceOrderFinal
  //   ? `Order value exceeds
  //             ₹${checkoutItems?.orderLimit ?? 1000}`
  //   : "";

  console.log("💚💚💚" + finalTotal);
  //razorpay
  const { mutate: createRazorpayOrder } = useCreateRazorpayOrder();
  const { mutate: verifyPayment } = useVerifyRazorpayPayment();
  const rzpRef = useRef(null);
  const [paymentInProgress, setPaymentInProgress] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden || document.visibilityState === "hidden") {
        try {
          rzpRef.current?.close();
        } catch (e) {}
        rzpRef.current = null;
        setPaymentInProgress(false);
      }
    };

    const handleBlur = () => {
      try {
        rzpRef.current?.close();
      } catch (e) {}
      rzpRef.current = null;
      setPaymentInProgress(false);
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("blur", handleBlur);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("blur", handleBlur);
      try {
        rzpRef.current?.close();
      } catch (e) {}
      rzpRef.current = null;
      setPaymentInProgress(false);
    };
  }, []);
  const addresses = checkoutItems?.addresses || [];
  const cartItems = checkoutItems?.checkOutItems || [];
  const cartTotal = checkoutItems?.total ?? 0;
  const defaultAddress =
    addresses.find((a) => a.isDefault) || addresses[0] || null;

  let finalItems = [];
  if (isBuyNow) {
    finalItems = [
      {
        productId: state.productID,
        variantId: state.variantID,
        sizeLabel: state.sizeLabel,
        quantity: state.quantity,
        finalPrice: state.price,
      },
    ];
  } else {
    finalItems = cartItems || [];
  }

  useEffect(() => {
    if (defaultAddress) {
      setSelectedAddress(defaultAddress._id);
    }
  }, [addresses]);
  useEffect(() => {
    const initialTotal = isBuyNow ? state.price * state.quantity : cartTotal;
    setDiscount(0);
    setCouponCode("");
    setFinalTotal(initialTotal);
  }, [checkoutItems, state, isBuyNow, cartTotal]);

  if (isLoading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }

  if (!checkoutItems && !isBuyNow) {
    return (
      <div className="text-center py-10 text-gray-600">
        No checkout data found
      </div>
    );
  }

  const handleAddressSelect = (addr) => {
    setSelectedAddress(addr._id);
  };

  const handleApplyCoupon = () => {
    if (!couponCode?.trim()) {
      toast.error("Enter coupon code");
      return;
    }

    const payload = { code: couponCode };
    if (isBuyNow) payload.directTotal = state.price * state.quantity;

    applyCouponFn(payload, {
      onSuccess: (res) => {
        setPassCoupon(couponCode);
        setCouponCode("");
        setDiscount(res.discount || 0);

        setFinalTotal(
          typeof res.finalTotal !== "undefined"
            ? res.finalTotal
            : isBuyNow
            ? state.price * state.quantity
            : cartTotal
        );
        toast.success(res.message || "Coupon applied");
      },
      onError: (err) => {
        setDiscount(0);
        setFinalTotal(isBuyNow ? state.price * state.quantity : cartTotal);
        toast.error(err?.response?.data?.message || "Invalid coupon");
      },
    });
  };

  const handleRazorpayPayment = () => {
    if (paymentInProgress) {
      toast.error("A payment is already in progress");
      return;
    }
    if (!selectedAddress) {
      toast.error("Select an address first");
      return;
    }

    const amount = Number(finalTotal);
    const cleanedFinalItems = finalItems.map((item) => ({
      productID: item.productId?._id,
      variantID: item.variantId?._id,
      vendorID: item.productId?.vendorID,
      categoryID: item?.productId?.catgid?._id,
      brandID: item?.productId?.brandID?._id,
      quantity: item.quantity,
      sizeLabel: item.sizeLabel,
      price: item.finalPrice,
    }));

    const orderPayload = {
      addressID: selectedAddress,
      orderedItems: cleanedFinalItems,
      paymentMethod: "Razorpay",
      totalPrice: subtotal,
      discount: discount,
      finalAmount: finalTotal,
      couponCode: passcoupon || null,
    };

    // 1) Create Razorpay Order
    createRazorpayOrder(
      { amount, orderPayload },
      {
        onSuccess: (data) => {
          const options = {
            key: import.meta.env.VITE_RAZORPAY_KEY_ID,
            amount: data.amount, // paise
            currency: "INR",
            order_id: data.razorpayOrderId,
            name: "Muscle X",
            description: "Order Payment",

            handler: function (response) {
              // 2) Verify Payment (FIRST ATTEMPT)
              verifyPayment(
                {
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature,
                  orderPayload,
                },
                {
                  onSuccess: (res) => {
                    try {
                      rzpRef.current?.close();
                    } catch (e) {}
                    rzpRef.current = null;
                    setPaymentInProgress(false);
                    toast.success("Payment Successful!");
                    navigate(`/user/ordersuccess/${res.order._id}`, {
                      replace: true,
                    });
                  },
                  onError: (err) => {
                    try {
                      rzpRef.current?.close();
                    } catch (e) {}
                    rzpRef.current = null;
                    setPaymentInProgress(false);
                    console.log(err);
                    navigate(`/user/orderfailed/${data.tempOrderId}`, {
                      replace: true,
                    });
                  },
                }
              );
            },
            theme: { color: "#8B5CF6" },
          };

          const rzp = new window.Razorpay(options);
          rzpRef.current = rzp;
          setPaymentInProgress(true);
          rzp.on("payment.failed", function () {
            try {
              rzpRef.current?.close();
            } catch (e) {}
            rzpRef.current = null;
            setPaymentInProgress(false);
            navigate(`/user/orderfailed/${data.tempOrderId}`, {
              replace: true,
            });
            setTimeout(() => {
              window.location.reload();
            }, 100);
          });

          rzp.open();
        },

        onError: () => toast.error("Failed to initialize payment"),
      }
    );
  };

  /////////
  const handlePlaceOrder = (paymentMethod) => {
    if (!selectedAddress) {
      toast.message("Select an address first");
      return;
    }

    const payload = {
      items: finalItems,
      addressID: selectedAddress,
      paymentMethod,
      couponCode: passcoupon?.trim() || null,
    };

    placeOrder(payload, {
      onSuccess: (data) => {
        toast.success(data.message);
        navigate(`/user/ordersuccess/${data?.order?._id}`, { replace: true });
      },
      onError: (err) => {
        toast.error(err?.response?.data?.message || "Order failed");
      },
    });
  };

  const subtotal = isBuyNow ? state.price * state.quantity : cartTotal;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">
                  Select Delivery Address
                </h2>
                <button
                  className="flex items-center gap-1 text-blue-500 text-sm font-medium hover:text-blue-600"
                  onClick={() => navigate("/user/userdetails/address")}
                >
                  <Plus size={16} />
                  ADD NEW ADDRESS
                </button>
              </div>

              {defaultAddress ? (
                <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex gap-3">
                      <MapPin className="text-red-500 mt-1" size={20} />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800">
                            {defaultAddress.fullName}
                          </span>
                          {defaultAddress.isDefault && (
                            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
                              DEFAULT
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-700">
                          {defaultAddress.addressLine}, {defaultAddress.city},{" "}
                          {defaultAddress.state} - {defaultAddress.pincode}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          Landmark: {defaultAddress.landmark}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          Phone: {defaultAddress.phone}
                        </p>
                      </div>
                    </div>
                    <button
                      className="text-blue-500 text-sm font-medium hover:text-blue-600"
                      onClick={() => handleAddressSelect(defaultAddress)}
                    >
                      {selectedAddress === defaultAddress._id
                        ? "selected"
                        : "deliver here"}
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No address found</p>
              )}

              {addresses
                .filter((a) => !a.isDefault && a !== defaultAddress)
                .map((addr) => (
                  <div
                    key={addr._id}
                    className="border rounded-lg p-4 mt-3 hover:border-blue-300 transition"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-800">
                          {addr.fullName}
                        </p>
                        <p className="text-sm text-gray-700">
                          {addr.addressLine}, {addr.city}, {addr.state} -{" "}
                          {addr.pincode}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          Landmark: {addr.landmark}
                        </p>
                        <p className="text-sm text-gray-700 mt-1">
                          Phone: {addr.phone}
                        </p>
                      </div>
                      <button
                        className="text-blue-500 text-sm font-medium hover:text-blue-600"
                        onClick={() => handleAddressSelect(addr)}
                      >
                        {selectedAddress === addr._id
                          ? "selected"
                          : "deliver here"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Apply Coupon
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleApplyCoupon}
                  disabled={applyingCoupon}
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400"
                >
                  {applyingCoupon ? "..." : "Apply"}
                </button>
              </div>
              {discount > 0 && (
                <div>
                  <p className="text-green-600 text-sm mt-2 font-semibold">
                    Coupon Applied: -₹{discount}
                  </p>
                  <button
                    onClick={() => location.reload()}
                    className="border rounded-sm p-1 cursor-pointer text-green-600 text-xs float-right"
                  >
                    remove coupon
                  </button>
                </div>
              )}
              <button
                className="text-blue-500 text-sm mt-2 hover:text-blue-600"
                onClick={() => setIsOpen(true)}
              >
                View Coupons
              </button>

              {isOpen && (
                <CouponList
                  coupons={coupons}
                  onClose={() => setIsOpen(false)}
                  onSelect={(code) => {
                    setCouponCode(code);
                  }}
                />
              )}

              {/* </Modal> */}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Your Order
            </h2>

            <div className="space-y-4 mb-6">
              {finalItems.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${
                        item.variantId?.images?.[0] || ""
                      }`}
                      alt={item.productId?.name}
                      className="w-14 h-14 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.productId?.name}{" "}
                        {item.variantId?.flavour
                          ? `(${item.variantId?.flavour})`
                          : ""}
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.sizeLabel} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">
                    ₹
                    {((item.finalPrice ?? item.price) * item.quantity).toFixed(
                      2
                    )}
                  </p>
                </div>
              ))}

              <div className="flex items-center justify-between">
                <p>Shipping:</p>
                <span className="text-green-600">Free</span>
              </div>
            </div>

            <div className="pt-4 mb-6">
              <div className="flex justify-between text-md">
                <span className="text-gray-600">Subtotal</span>
                <span>₹{Number(subtotal).toFixed(2)}</span>
              </div>

              <div className="flex justify-between text-md mt-1">
                <span className="text-gray-600">Discount</span>
                <span className="text-green-600">
                  - ₹{discount.toFixed ? discount.toFixed(2) : discount}
                </span>
              </div>

              <div className="flex justify-between text-lg font-semibold mt-2">
                <span className="text-gray-800">Final Total</span>
                <span className="text-gray-800">
                  ₹{Number(finalTotal).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <button
                className="w-full text-[13px] bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition"
                onClick={handleRazorpayPayment}
                disabled={placingOrder || paymentInProgress}
              >
                <ShoppingBag size={14} />
                {placingOrder
                  ? "Processing..."
                  : paymentInProgress
                  ? "Payment in progress..."
                  : "PAY WITH RAZORPAY"}
              </button>

              <button
                onClick={() => handlePlaceOrder("COD")}
                disabled={placingOrder || !isCODAllowed}
                title={
                  !isCODAllowed
                    ? `Cash on Delivery is available only for orders up to ₹${COD_LIMIT}`
                    : ""
                }
                className={`w-full text-[13px] font-medium py-2 rounded-md
    flex items-center justify-center gap-2 transition
    ${
      placingOrder || !isCODAllowed
        ? "bg-gray-400 cursor-not-allowed"
        : "bg-gray-800 hover:bg-gray-900 text-white"
    }
  `}
              >
                <CreditCard size={14} />
                {placingOrder ? "Processing..." : "CASH ON DELIVERY"}
              </button>
              <button
                onClick={() => handlePlaceOrder("Wallet")}
                className="w-full text-[13px] bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition"
                disabled={placingOrder}
              >
                <Wallet size={14} />
                PAY WITH WALLET
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
