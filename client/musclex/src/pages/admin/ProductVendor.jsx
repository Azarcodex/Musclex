import React from "react";
import { useGetVendorProducts } from "../../hooks/admin/useGetVendorProducts";
import VendorTable from "../../components/vendor/VendorProductTable";

const ProductVendor = () => {
  const { data } = useGetVendorProducts();
  console.log(data?.vendors);
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 via-white to-purple-100 flex justify-center items-center">
      <div className="max-w-4xl w-full">
        <VendorTable vendors={data?.vendors} />
      </div>
    </div>
  );
};

export default ProductVendor;
