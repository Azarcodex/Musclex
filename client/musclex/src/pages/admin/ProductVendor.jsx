import React, { useEffect, useState } from "react";
import { useGetVendorProducts } from "../../hooks/admin/useGetVendorProducts";
import DataTable from "../../components/utils/Table";
import { useNavigate } from "react-router-dom";
import { SearchIcon } from "lucide-react";

const ProductVendor = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [debounce, setDebounce] = useState(search);
  useEffect(() => {
    const timeOut = setTimeout(() => {
      setDebounce(search);
    }, 500);
    return () => clearTimeout(timeOut);
  }, [search]);
  let limit = 5;
  const { data, isPending } = useGetVendorProducts(page, limit, debounce);
  const HandleProductId = (id) => {
    console.log("hello");
    navigate(`/admin/dashboard/vendors/list/products/${id}`);
  };
  // console.log(data);
  // console.log(data);
  const columns = [
    {
      header: "#",
      cell: (info) => (page - 1) * limit + info.row.index + 1,
    },
    { header: "ShopName", accessorKey: "shopName" },
    { header: "email", accessorKey: "email" },
    { header: "totalProducts", accessorKey: "totalProducts" },
  ];
  // console.log(data?.vendors);
  return (
    <div className=" bg-white flex  justify-center items-center flex-col">
      <div className="place-self-end flex items-center justify-between">
        <input
          type="search"
          placeholder="enter shopName/email"
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="border-b-2 border-purple-700 outline-0"
        />
        <SearchIcon className="w-4 h-4" />
      </div>
      <div className="max-w-4xl w-full">
        <DataTable
          columns={columns}
          data={data?.vendors}
          isLoading={isPending}
          onPageChange={setPage}
          page={page}
          totalPages={data?.pagination.totalPages}
          onRowChange={HandleProductId}
        />
      </div>
    </div>
  );
};

export default ProductVendor;
