import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useVendorOwnProducts } from "../../hooks/admin/useVendorOwnProducts";
import ProductTable from "../../components/admin/ProductTable";
import DataTable from "../../components/utils/Table";
import { Eye } from "lucide-react";
import { confirm } from "../../components/utils/Confirmation";
import { toast } from "sonner";
import { useBlockProduct } from "../../hooks/admin/useBlockProduct";

const OwnProducts = () => {
  const { id } = useParams();
  const { data } = useVendorOwnProducts(id);
  console.log(data);
  const navigate = useNavigate();
  const { mutate: toggleProduct } = useBlockProduct();
  const handleStatus = async (id) => {
    const wait = await confirm({ message: "do you want to make changes" });
    if (wait) {
      toggleProduct(id, {
        onSuccess: (data) => {
          toast.success(data.message);
        },
        onError: (err) => {
          toast.error(err.response.data.message);
        },
      });
    }
  };
  const columns = [
    { header: "productName", accessorKey: "name" },
    { header: "description", accessorKey: "description" },
    { header: "category", accessorKey: "catgid.catgName" },
    { header: "brand", accessorKey: "brandID.brand_name" },
    { header: "rating", accessorKey: "Avgrating" },

    {
      header: "Date",
      cell: (info) => {
        const createdAt = info.row.original?.createdAt;
        if (!createdAt) return "N/A";

        const date = new Date(createdAt);
        return date.toLocaleDateString("en-IN", {
          year: "numeric",
          month: "short",
          day: "numeric",
        });
      },
    },

    {
      header: "Status",
      cell: (info) => {
        const product = info.row.original;

        return (
          <div
            className="cursor-pointer flex items-center gap-2"
            onClick={() => handleStatus(product._id)}
          >
            <Eye size={18} className="text-purple-700" />

            <span
              className={`${
                product.isActive ? "text-green-600" : "text-red-600"
              } text-sm font-medium`}
            >
              {product.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        );
      },
    },
  ];

  return (
    <div className="bg-white flex justify-center items-start">
      <div className="max-w-6xl w-full">
        <DataTable columns={columns} data={data?.products} />
      </div>
    </div>
  );
};

export default OwnProducts;
