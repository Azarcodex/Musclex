import React, { useState } from "react";
import { Copy, Gift } from "lucide-react";
import { useGetUserdata } from "../../../hooks/users/useGetUserdata";
import { toast } from "sonner";

const Referral = () => {
  const { data } = useGetUserdata();
  const referralCode = data?.user?.referralCode || "";
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="min-h-[80vh] flex justify-center items-center p-4">
      <div className="w-full max-w-md bg-white shadow-lg rounded-xl p-6 space-y-6">
        {/* Heading */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">Referral Program</h1>
          <p className="text-gray-600 mt-1 text-sm">
            Invite friends and earn rewards
          </p>
        </div>

        {/* Reward Box */}
        <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 flex items-center gap-3">
          <Gift className="text-purple-700" size={26} />
          <div>
            <p className="text-sm font-semibold text-purple-800">Earn ₹50</p>
            <p className="text-xs text-purple-700">
              When your friend signs up using your referral code.
            </p>
          </div>
        </div>

        {/* Referral Code Box */}
        <div className="border rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-500">Your Referral Code</p>
            <p className="text-xl font-bold tracking-wider">{referralCode}</p>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-gray-900 text-white px-3 py-2 rounded-md hover:bg-gray-800 transition"
          >
            <Copy size={16} />
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        {/* Share Message */}
        <div className="text-center text-sm text-gray-600 border-t pt-4">
          Share this code with your friends to get rewards!
        </div>
      </div>
    </div>
  );
};

export default Referral;
