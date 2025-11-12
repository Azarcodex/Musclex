// pages/user/AddressesPage.jsx
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  useAddAddress,
  useAddresses,
  useDefaultAddress,
  useDeleteAddress,
  useEditAddress,
} from "../../../hooks/users/useAddress";
import AddressForm from "../../../components/user/Addressform";
import { Pencil, Trash, VerifiedIcon } from "lucide-react";
import { confirm } from "../../../components/utils/Confirmation";

const AddressesPage = () => {
  const { data: addresses = [], isLoading } = useAddresses();
  const { mutate: addAddress, isPending } = useAddAddress();
  const { mutate: editAddress, isPending: isLoad } = useEditAddress();
  const { mutate: deleteAddress } = useDeleteAddress();
  const { mutate: defaultAddress } = useDefaultAddress();
  const [showForm, setShowForm] = useState(false);
  const [editmode, setEditmode] = useState(false);
  const [currentEdit, setCurrentEdit] = useState("");
  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <p className="text-gray-600 text-lg font-medium">
          Loading addresses...
        </p>
      </div>
    );

  const handleAdd = (data) => {
    addAddress(data, {
      onSuccess: () => {
        toast.success("Address added successfully!");
        setShowForm(false);
      },
      onError: (err) => {
        toast.error(err.response?.data?.message || "Failed to add address.");
      },
    });
  };
  //edit
  const HandleEdit = (id) => {
    const address = addresses.find((address) => address._id === id);
    setCurrentEdit(address);
    setEditmode(true);
  };
  const HandleEditSubmit = (data) => {
    editAddress(
      { id: currentEdit._id, data },
      {
        onSuccess: (data) => {
          toast.success(`${data.message}`);
          setEditmode(false);
        },
        onError: (err) => {
          toast.error(`${err.response.data.message}`);
        },
      }
    );
  };
  const HandleDelete = async (id) => {
    const wait = await confirm({ message: "Do you want to delete it" });
    if (wait) {
      deleteAddress(id, {
        onSuccess: (data) => {
          toast.success(`${data.message}`);
        },
        onError: (err) => {
          toast.err(`${err.response.data.message}`);
        },
      });
    }
  };
  const HandleDefault = async (id) => {
    const wait = await confirm({
      message: "Are you sure yo want to make these address default",
    });
    if (wait) {
      defaultAddress(id, {
        onSuccess: (data) => {
          toast.success(`${data.message}`);
        },
      });
    }
  };
  return (
    <div className="max-w-4xl mx-auto px-5 py-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 border-b pb-3">
        <h1 className="text-2xl font-bold text-gray-800">My Addresses</h1>
        <button
          onClick={() => setShowForm((prev) => !prev)}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium px-4 py-2 rounded-md shadow-sm transition"
        >
          {showForm ? "Cancel" : "Add Address"}
        </button>
      </div>

      {/* Add Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            {isPending ? "Saving..." : "Add New Address"}
          </h2>
          <AddressForm
            onSubmit={handleAdd}
            initialData={null}
            onClose={() => setShowForm(false)}
          />
        </div>
      )}
      {editmode && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-5 mb-6">
          <h2 className="text-lg font-semibold text-gray-700 mb-3">
            {isLoad ? "Saving..." : " Update Address"}
          </h2>
          <AddressForm
            onSubmit={HandleEditSubmit}
            initialData={currentEdit}
            onClose={() => setEditmode(false)}
          />
        </div>
      )}

      {/* Address List */}
      <div className="grid gap-4">
        {addresses.length === 0 && (
          <p className="text-gray-500 text-sm italic">
            No addresses added yet.
          </p>
        )}

        {addresses?.map((a) => (
          <div
            key={a._id}
            className={`p-5 rounded-lg border transition shadow-sm hover:shadow-md hover:border-purple-500  ${
              a.isDefault
                ? "border-purple-600 bg-purple-50"
                : "border-gray-200 bg-white"
            }`}
          >
            <span className="float-right flex items-center gap-3">
              <button onClick={() => HandleEdit(a._id)}>
                <Pencil className="w-4 h-4 text-purple-600 cursor-pointer" />
              </button>
              <button onClick={() => HandleDelete(a._id)}>
                <Trash className="w-4 h-4 text-purple-600 cursor-pointer" />
              </button>
              <button onClick={() => HandleDefault(a._id)}>
                <VerifiedIcon
                  className={`w-4 h-4 cursor-pointer ${
                    a.isDefault ? "text-green-700" : ""
                  }`}
                />
              </button>
            </span>
            <div>
              <h3 className="font-semibold text-lg text-gray-800 mb-1">
                {a.fullName}{" "}
                {a.isDefault && (
                  <span className="text-sm text-purple-600 font-medium ml-1">
                    (Default)
                  </span>
                )}
              </h3>
              <p className="text-sm text-gray-700">
                {a.addressLine}, {a.city}, {a.state} - {a.pincode}
              </p>
              {a.landmark && (
                <p className="text-sm text-gray-500">Landmark: {a.landmark}</p>
              )}
              <p className="text-sm text-gray-700 mt-1">
                <span className="font-medium">Phone:</span> {a.phone}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AddressesPage;
