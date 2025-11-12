import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useVendorOwnProducts } from "../../hooks/admin/useVendorOwnProducts";
import ProductTable from "../../components/admin/ProductTable";
import DataTable from "../../components/utils/Table";

const OwnProducts = () => {
  const { id } = useParams();
  const { data } = useVendorOwnProducts(id);
  console.log(data);
  const navigate = useNavigate();
  const columns = [
    //  { header: "#", cell: (info) => (page - 1) * limit + info.row.index + 1 },
    { header: "productName", accessorKey: "name" },
    { header: "description", accessorKey: "description" },
    { header: "category", accessorKey: "catgid.catgName" },
    { header: "brand", accessorKey: "brandID.brand_name" },
    { header: "rating", accessorKey: "Avgrating" },
    { header: "status", accessorKey: "" },
    {
      header: "Date",
      cell: (info) => {
        const createdAt = info.row.original?.createdAt;
        if (!createdAt) return "N/A";

        const date = new Date(createdAt);
        if (isNaN(date)) return "Invalid Date";

        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },
  ];
  return (
    <div className="bg-white flex justify-center items-start">
      <div className="max-w-6xl w-full">
        <DataTable
          columns={columns}
          data={data?.products}
        />
      </div>
    </div>
  );
};

export default OwnProducts;
