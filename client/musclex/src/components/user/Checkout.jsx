// import React, { useEffect, useState } from "react";
// import { MapPin, Plus, CreditCard, Wallet, ShoppingBag } from "lucide-react";
// import { useGetCheckout } from "../../hooks/users/useGetCheckout";
// import { useOrder } from "../../hooks/users/useOrder";
// import { toast } from "sonner";
// import { useLocation, useNavigate } from "react-router-dom";

// export default function Checkout() {
//   const navigate = useNavigate();
//   const [selectedAddress, setSelectedAddress] = useState(null);
//   const { data: checkoutItems, isLoading } = useGetCheckout();
//   const { mutate: placeOrder } = useOrder();
//   const addresses = checkoutItems?.addresses || [];
//   const cartItems = checkoutItems?.cartItems || [];
//   const total = checkoutItems?.total || 0;
//   const defaultAddress = addresses.find((addr) => addr.isDefault ?? addr[0]);
//   const { state } = useLocation();
//   const isbuyNow = state?.buyNow === true;

//   useEffect(() => {
//     if (defaultAddress) {
//       setSelectedAddress(defaultAddress._id);
//     }
//   }, [addresses]);
//   const HandleAddress = (address) => {
//     setSelectedAddress(address._id);
//   };
//   if (isLoading) {
//     return <div className="text-center py-10 text-gray-600">Loading...</div>;
//   }

//   if (!checkoutItems) {
//     return (
//       <div className="text-center py-10 text-gray-600">
//         No checkout data found
//       </div>
//     );
//   }
//   //place order
//   const HandlePlaceOrder = (paymentMethod) => {
//     if (!selectedAddress) {
//       return toast.message("select an address first");
//     }
//     placeOrder(
//       { addressId: selectedAddress, paymentMethod },
//       {
//         onSuccess: (data) => {
//           console.log(data);
//           toast.success(`${data.message}`);
//           navigate(`/user/ordersuccess/${data?.order?._id}`, { replace: true });
//         },
//       }
//     );
//   };
//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-8">
//       <div className="max-w-6xl mx-auto">
//         <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
//           {/* LEFT SECTION */}
//           <div className="space-y-6">
//             {/* Delivery Address */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <div className="flex items-center justify-between mb-4">
//                 <h2 className="text-lg font-semibold text-gray-800">
//                   Select Delivery Address
//                 </h2>
//                 <button
//                   className="flex items-center gap-1 text-blue-500 text-sm font-medium hover:text-blue-600"
//                   onClick={() => navigate("/user/userdetails/address")}
//                 >
//                   <Plus size={16} />
//                   ADD NEW ADDRESS
//                 </button>
//               </div>

//               {/* Default Address */}
//               {defaultAddress ? (
//                 <div className="border border-red-200 bg-red-50 rounded-lg p-4 mb-3">
//                   <div className="flex items-start justify-between">
//                     <div className="flex gap-3">
//                       <MapPin className="text-red-500 mt-1" size={20} />
//                       <div>
//                         <div className="flex items-center gap-2 mb-1">
//                           <span className="font-medium text-gray-800">
//                             {defaultAddress.fullName}
//                           </span>
//                           {defaultAddress.isDefault && (
//                             <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded">
//                               DEFAULT
//                             </span>
//                           )}
//                         </div>
//                         <p className="text-sm text-gray-700">
//                           {defaultAddress.addressLine}, {defaultAddress.city},{" "}
//                           {defaultAddress.state} - {defaultAddress.pincode}
//                         </p>
//                         <p className="text-sm text-gray-700 mt-1">
//                           Landmark: {defaultAddress.landmark}
//                         </p>
//                         <p className="text-sm text-gray-700 mt-1">
//                           Phone: {defaultAddress.phone}
//                         </p>
//                       </div>
//                     </div>
//                     <button
//                       className="text-blue-500 text-sm font-medium hover:text-blue-600"
//                       onClick={() => HandleAddress(defaultAddress)}
//                     >
//                       {selectedAddress === defaultAddress._id
//                         ? "selected"
//                         : "deliver here"}
//                     </button>
//                   </div>
//                 </div>
//               ) : (
//                 <p className="text-sm text-gray-500">No address found</p>
//               )}

//               {/* Other Addresses */}
//               {addresses
//                 .filter((addr) => !addr.isDefault)
//                 .map((addr) => (
//                   <div
//                     key={addr._id}
//                     className="border rounded-lg p-4 mt-3 hover:border-blue-300 transition"
//                   >
//                     <div className="flex items-start justify-between">
//                       <div>
//                         <p className="font-medium text-gray-800">
//                           {addr.fullName}
//                         </p>
//                         <p className="text-sm text-gray-700">
//                           {addr.addressLine}, {addr.city}, {addr.state} -{" "}
//                           {addr.pincode}
//                         </p>
//                         <p className="text-sm text-gray-700 mt-1">
//                           Landmark: {addr.landmark}
//                         </p>
//                         <p className="text-sm text-gray-700 mt-1">
//                           Phone: {addr.phone}
//                         </p>
//                       </div>
//                       <button
//                         className="text-blue-500 text-sm font-medium hover:text-blue-600"
//                         onClick={() => HandleAddress(addr)}
//                       >
//                         {selectedAddress === addr._id
//                           ? "selected"
//                           : "deliver here"}
//                       </button>
//                     </div>
//                   </div>
//                 ))}
//             </div>

//             {/* Apply Coupon */}
//             <div className="bg-white rounded-lg shadow-sm p-6">
//               <h2 className="text-lg font-semibold text-gray-800 mb-4">
//                 Apply Coupon
//               </h2>
//               <div className="flex gap-2">
//                 <input
//                   type="text"
//                   placeholder="Enter coupon code"
//                   className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 />
//                 <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
//                   Apply
//                 </button>
//               </div>
//               <button className="text-blue-500 text-sm mt-2 hover:text-blue-600">
//                 View Coupons
//               </button>
//             </div>
//           </div>

//           {/* RIGHT SECTION */}
//           <div className="bg-white rounded-lg shadow-sm p-6">
//             <h2 className="text-lg font-semibold text-gray-800 mb-4">
//               Your Order
//             </h2>

//             {/* Cart Items */}
//             <div className="space-y-4 mb-6">
//               {cartItems &&
//                 cartItems.length > 0 &&
//                 cartItems.map((item) => (
//                   <div
//                     key={item._id}
//                     className="flex items-center justify-between border-b pb-3"
//                   >
//                     <div className="flex items-center gap-3">
//                       <img
//                         src={`${import.meta.env.VITE_API_URL}${
//                           item.variantId?.images?.[0]
//                         }`}
//                         alt={item.productId?.name}
//                         className="w-14 h-14 object-cover rounded"
//                       />
//                       <div>
//                         <p className="text-sm font-medium text-gray-800">
//                           {item.productId?.name} ({item.variantId?.flavour})
//                         </p>
//                         <p className="text-xs text-gray-500">
//                           {item.sizeLabel} × {item.quantity}
//                         </p>
//                       </div>
//                     </div>
//                     <p className="font-semibold text-gray-800">
//                       ₹{(item?.price * item?.quantity).toFixed(2)}
//                     </p>
//                   </div>
//                 ))}
//               {/* buy now individual */}
//               {isbuyNow && (
//                 <div className="flex items-center justify-between border-b pb-3">
//                   <div className="flex items-center gap-3">
//                     <img
//                       src={`${import.meta.env.VITE_API_URL}${
//                         state?.variantID?.images?.[0]
//                       }`}
//                       alt={state.productID?.name}
//                       className="w-14 h-14 object-cover rounded"
//                     />
//                     <div>
//                       <p className="text-sm font-medium text-gray-800">
//                         {state.productID?.name} ({state.variantID?.flavour})
//                       </p>
//                       <p className="text-xs text-gray-500">
//                         {state.sizeLabel} × {state.quantity}
//                       </p>
//                     </div>
//                   </div>
//                   <p className="font-semibold text-gray-800">
//                     ₹{(state?.price * state?.quantity).toFixed(2)}
//                   </p>
//                 </div>
//               )}
//             </div>

//             {/* Total */}
//             <div className=" pt-4 mb-6">
//               <div className="flex justify-between text-lg font-semibold">
//                 <span className="text-gray-800">Total</span>
//                 {!isbuyNow ? (
//                   <span className="text-gray-800">₹{total.toFixed(2)}</span>
//                 ) : (
//                   <span className="text-gray-800">
//                     ₹{state?.price * state?.quantity}
//                   </span>
//                 )}
//               </div>
//             </div>

//             {/* Payment Buttons */}
//             <div className="space-y-2">
//               <button className="w-full  text-[13px] bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition">
//                 <ShoppingBag size={10} />
//                 RAZORPAY
//               </button>
//               <button
//                 onClick={() => HandlePlaceOrder("COD")}
//                 className="w-full text-[13px] bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition"
//               >
//                 <CreditCard size={10} />
//                 CASH ON DELIVERY
//               </button>
//               <button className="w-full text-[13px] bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition">
//                 <Wallet size={10} />
//                 PAY WITH WALLET
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { MapPin, Plus, CreditCard, Wallet, ShoppingBag } from "lucide-react";
import { useGetCheckout } from "../../hooks/users/useGetCheckout";
import { useOrder } from "../../hooks/users/useOrder";
import { toast } from "sonner";
import { useLocation, useNavigate } from "react-router-dom";

export default function Checkout() {
  const navigate = useNavigate();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const { data: checkoutItems, isLoading } = useGetCheckout();
  const { mutate: placeOrder } = useOrder();
  const addresses = checkoutItems?.addresses || [];
  const cartItems = checkoutItems?.cartItems || [];
  const total = checkoutItems?.total || 0;
  const defaultAddress = addresses.find((addr) => addr.isDefault ?? addr[0]);
  const { state } = useLocation();
  const isbuyNow = state?.buyNow === true;

  // 🔥 NEW → Build final items (Buy Now OR Cart)
  let finalItems = [];

  if (isbuyNow) {
    finalItems = [
      {
        _id: state.variantID?._id,
        productId: state.productID,
        variantId: state.variantID,
        sizeLabel: state.sizeLabel,
        quantity: state.quantity,
        price: state.price,
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

  const HandleAddress = (address) => {
    setSelectedAddress(address._id);
  };

  if (isLoading) {
    return <div className="text-center py-10 text-gray-600">Loading...</div>;
  }

  if (!checkoutItems) {
    return (
      <div className="text-center py-10 text-gray-600">
        No checkout data found
      </div>
    );
  }

  //place order
  const HandlePlaceOrder = (paymentMethod) => {
    if (!selectedAddress) {
      return toast.message("select an address first");
    }
    placeOrder(
      { addressId: selectedAddress, paymentMethod },
      {
        onSuccess: (data) => {
          console.log(data);
          toast.success(`${data.message}`);
          navigate(`/user/ordersuccess/${data?.order?._id}`, { replace: true });
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* LEFT SECTION */}
          <div className="space-y-6">
            {/* Delivery Address */}
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

              {/* Default Address */}
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
                      onClick={() => HandleAddress(defaultAddress)}
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

              {/* Other Addresses */}
              {addresses
                .filter((addr) => !addr.isDefault)
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
                        onClick={() => HandleAddress(addr)}
                      >
                        {selectedAddress === addr._id
                          ? "selected"
                          : "deliver here"}
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {/* Apply Coupon */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">
                Apply Coupon
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Enter coupon code"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200">
                  Apply
                </button>
              </div>
              <button className="text-blue-500 text-sm mt-2 hover:text-blue-600">
                View Coupons
              </button>
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Your Order
            </h2>

            {/* Items List */}
            <div className="space-y-4 mb-6">
              {finalItems.map((item) => (
                <div
                  key={item._id}
                  className="flex items-center justify-between border-b pb-3"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={`${import.meta.env.VITE_API_URL}${
                        item.variantId?.images?.[0]
                      }`}
                      alt={item.productId?.name}
                      className="w-14 h-14 object-cover rounded"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-800">
                        {item.productId?.name} ({item.variantId?.flavour})
                      </p>
                      <p className="text-xs text-gray-500">
                        {item.sizeLabel} × {item.quantity}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold text-gray-800">
                    ₹{(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="pt-4 mb-6">
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-gray-800">Total</span>
                <span className="text-gray-800">
                  ₹{isbuyNow ? state.price * state.quantity : total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Payment Buttons */}
            <div className="space-y-2">
              <button className="w-full text-[13px] bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition">
                <ShoppingBag size={10} />
                RAZORPAY
              </button>
              <button
                onClick={() => HandlePlaceOrder("COD")}
                className="w-full text-[13px] bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition"
              >
                <CreditCard size={10} />
                CASH ON DELIVERY
              </button>
              <button className="w-full text-[13px] bg-gray-800 hover:bg-gray-900 text-white font-medium py-2 rounded-md flex items-center justify-center gap-2 transition">
                <Wallet size={10} />
                PAY WITH WALLET
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
