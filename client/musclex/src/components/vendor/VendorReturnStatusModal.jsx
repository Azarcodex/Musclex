import { useState, useEffect } from "react";
import { toast } from "sonner";

function VendorReturnStatusModal({ item, orderId, setOpenModal, onUpdate }) {
  const [selectedStatus, setSelectedStatus] = useState("");
  const [vendorReason, setVendorReason] = useState("");
  const getNextStatuses = () => {
    switch (item.returnStatus) {
      case "Requested":
        return ["Approved", "Rejected"];
      case "Approved":
        return ["Completed"];
      default:
        return [];
    }
  };

  const nextStatuses = getNextStatuses();

  const handleSubmit = () => {
    if (!selectedStatus) return;
    onUpdate(
      {
        orderId: orderId,
        itemId: item._id,
        newStatus: selectedStatus,
        vendorReason,
      },
      {
        onSuccess: (data) => {
          setOpenModal(false);
          toast.success(data.message);
        },
        onError: (err) => {
          toast.error(err.response.data.message);
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-[350px] rounded-xl p-5 shadow-lg space-y-4">
        {/* Modal Header */}
        <h2 className="text-lg font-semibold text-gray-800">
          Return Status - {item.productID?.name}
        </h2>

        {/* Return Reason */}
        <div>
          <p className="text-xs text-gray-500">Return Reason</p>
          <p className="text-sm text-gray-800 font-medium">
            {item.returnReason}
          </p>
        </div>

        {/* Return Date */}
        <div>
          <p className="text-xs text-gray-500">Requested On</p>
          <p className="text-sm text-gray-800 font-medium">
            {new Date(item.returnDate).toLocaleDateString()}
          </p>
        </div>

        {/* Select Dropdown */}
        {nextStatuses.length > 0 ? (
          <div className="flex items-start flex-col justify-between">
            <label className="text-xs text-left text-gray-500">
              Update Status
            </label>
            <select
              className="w-full mt-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="">Select...</option>
              {nextStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
            {selectedStatus === "Rejected" && (
              <textarea
                className="bg-white w-full mt-4 mx-auto border rounded-sm p-0.5 border-purple-600 outline-0 resize-none overflow-hidden"
                placeholder="Give the reason"
                value={vendorReason}
                onChange={(e) => {
                  setVendorReason(e.target.value);

                  e.target.style.height = "auto";
                  e.target.style.height = e.target.scrollHeight + "px";
                }}
                required
              />
            )}
          </div>
        ) : (
          <p className="text-xs text-gray-500 italic">
            No further actions available.
          </p>
        )}

        {/* Buttons */}
        <div className="flex justify-end gap-3 pt-2">
          <button
            className="px-3 py-1.5 text-sm bg-gray-200 rounded-md hover:bg-gray-300"
            onClick={() => setOpenModal(false)}
          >
            Close
          </button>

          {nextStatuses.length > 0 && (
            <button
              className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
              onClick={handleSubmit}
            >
              Update
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default VendorReturnStatusModal;
