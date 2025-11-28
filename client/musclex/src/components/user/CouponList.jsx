import React, { useEffect, useState } from "react";
import { X, Copy, Check, IndianRupee } from "lucide-react";

export default function CouponModal({ coupons, onClose }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  const handleClose = () => {
    setIsOpen(false);
    if (onClose) onClose();
  };

  const copyToClipboard = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (!isOpen) return null;
  useEffect(() => {
    // Disable scrolling when modal is open
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when modal closes
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);
  return (
    <div
      className="fixed inset-0 backdrop-blur-sm flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h2 className="text-base font-semibold text-gray-800">
            Available Coupons
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Coupons List */}
        <div className="p-4 space-y-3 max-h-96 overflow-y-auto">
          {coupons?.coupons.map((coupon, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-3 hover:border-purple-300 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-purple-100 text-purple-700 font-semibold px-2 py-1 rounded text-xs">
                    ${coupon.discountValue} OFF
                  </div>
                  <div className="text-xs text-gray-500">
                    Valid until {formatDate(coupon.endDate)}
                  </div>
                  <div>
                    <span className="flex items-center text-xs font-semibold text-purple-700">
                      Minimum purchase :<IndianRupee className="w-4 h-4" />
                      {coupon.minPurchase}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded px-3 py-2">
                  <p className="text-sm font-mono font-semibold text-gray-800 text-center">
                    {coupon.code}
                  </p>
                </div>
                <button
                  onClick={() => copyToClipboard(coupon.code)}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-2 rounded text-sm font-medium flex items-center gap-1.5 transition-colors"
                >
                  {copiedCode === coupon.code ? (
                    <>
                      <Check size={16} />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      Copy
                    </>
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
