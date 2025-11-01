import React from "react";
import { useParams } from "react-router-dom";
import { useVendorOwnProducts } from "../../hooks/admin/useVendorOwnProducts";
import ProductTable from "../../components/admin/ProductTable";

const OwnProducts = () => {
  const { id } = useParams();
  const { data } = useVendorOwnProducts(id);
  return(
     <div>
        <ProductTable products={data?.products} />
     </div>
  )
};

export default OwnProducts;
