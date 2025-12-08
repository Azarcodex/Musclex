import { useQuery } from "@tanstack/react-query";
import { getSalesReport } from "../../services/vendor/salesreport";

export const useGetSalesReport = (page,filter) => {
  return useQuery({
    queryKey: ["salesReport",page,filter],
    queryFn: ()=>getSalesReport({page,filter}),
  });
};
