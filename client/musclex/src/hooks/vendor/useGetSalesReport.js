import { useQuery } from "@tanstack/react-query";
import { getSalesReport } from "../../services/vendor/salesreport";

export const useGetSalesReport = (page) => {
  return useQuery({
    queryKey: ["salesReport",page],
    queryFn: ()=>getSalesReport({page}),
  });
};
