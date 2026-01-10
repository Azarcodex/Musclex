import React, { useEffect, useState } from "react";
import { X, Copy, Check, IndianRupee, Tag } from "lucide-react";

export default function CouponModal({ coupons, onClose }) {
  const [copiedCode, setCopiedCode] = useState(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Disable scrolling when modal is open
    document.body.style.overflow = "hidden";

    // Re-enable scrolling when modal closes
    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

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

  const hasCoupons = coupons?.coupons && coupons.coupons.length > 0;

  return (
    <div
      className="fixed inset-0 backdrop-blur-md flex items-center justify-center p-4 z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl max-w-lg w-full"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-800">
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
        <div className="p-6 max-h-96 overflow-y-auto">
          {hasCoupons ? (
            <div className="space-y-4">
              {coupons.coupons.map((coupon, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:shadow-md transition-all"
                >
                  {/* Discount Badge and Validity */}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <div className="bg-purple-100 text-purple-700 font-semibold px-3 py-1 rounded-md text-sm">
                      ${coupon.discountValue} OFF
                    </div>
                    <div className="text-xs text-gray-500">
                      Valid until {formatDate(coupon.endDate)}
                    </div>
                  </div>

                  {/* Minimum Purchase */}
                  <div className="mb-3">
                    <span className="flex items-center text-sm text-gray-600">
                      <span className="font-medium">Minimum purchase:</span>
                      <IndianRupee className="w-4 h-4 ml-1" />
                      <span className="font-semibold text-purple-700">
                        {coupon.minPurchase}
                      </span>
                    </span>
                  </div>

                  {/* Coupon Code and Copy Button */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-gray-50 border border-dashed border-gray-300 rounded-md px-4 py-2.5">
                      <p className="text-sm font-mono font-semibold text-gray-800 text-center">
                        {coupon.code}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(coupon.code)}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors"
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
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-gray-100 rounded-full p-6 mb-4">
                <Tag className="w-12 h-12 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                No Coupons Available
              </h3>
              <p className="text-sm text-gray-500 max-w-xs">
                There are no coupons available at the moment. Check back later
                for exciting offers!
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
