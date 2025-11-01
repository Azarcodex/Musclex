import React, { useEffect, useState } from "react";
import { useGetUsers } from "../../hooks/admin/useGetUsers";
import { CheckCircle, XCircle } from "lucide-react";
import { useVerifyUser } from "../../hooks/admin/useVerifyUser";
import { confirm } from "../../components/utils/Confirmation";

const Users = () => {
  const [search, setSearch] = useState("");
  const [page, setpage] = useState(1);
  const { data, isPending } = useGetUsers(page, search);
  const { mutate: toggleVerify, isPending: isToggling } = useVerifyUser();
  console.log(data?.users);
  const handlePrev = () => {
    if (page > 1) setpage((prev) => prev - 1);
  };
  const handleNext = () => {
    console.log("clicked");
    if (page < data?.pagination?.totalPages) {
      setpage((prev) => prev + 1);
    }
  };
  const HandleSearch=(e)=>
  {
    setSearch(e.target.value)
    setpage(1)
  }
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
  const HandleToggle=async(id)=>
  {
    const wait=await confirm({message:"Do you want to make changes"})
    if(wait)
    {
      toggleVerify(id)
    }
  }
  return (
    <div className="w-full">
      <div className="bg-violet-100 place-self-end px-1 py-1.5 mb-1 rounded-sm focus:border border-gray-200">
        <input
          type="search"
          name="search"
          placeholder="search name/email"
          onChange={(e) => HandleSearch(e)}
          className="outline-0 px-1 py-0.5 border-0 rounded-md placeholder:text-sm"
          autoComplete="off"
        />
      </div>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  #
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Name
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Created At
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                  Action
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-200">
              {data?.users?.map((user, index) => (
                <tr
                  key={user._id}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {(data?.pagination.currentPage - 1) *
                      data?.pagination?.limit +
                      index +
                      1}
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.isVerified ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle size={14} />
                        available
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <XCircle size={14} />
                        Not Available
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <button
                      onClick={() => HandleToggle(user._id)}
                      disabled={isToggling}
                      className={`px-3 py-1 text-xs rounded-md font-medium transition ${
                        user.isVerified
                          ? "bg-red-100 text-red-700 hover:bg-red-200"
                          : "bg-green-100 text-green-700 hover:bg-green-200"
                      }`}
                    >
                      {user.isVerified ? "block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {/*Pagination controls */}
      <div className="flex justify-center items-center gap-3 mt-4">
        <button
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
          onClick={handlePrev}
          disabled={page === 1}
        >
          previous
        </button>
        <span className="text-sm text-gray-700">
          Page {data?.pagination?.currentPage} of {data?.pagination?.totalPages}
        </span>
        <button
          onClick={handleNext}
          disabled={page === data?.pagination?.totalPages}
          className="px-4 py-2 bg-gray-200 rounded-md disabled:opacity-50"
        >
          next
        </button>
      </div>
    </div>
  );
};

export default Users;
