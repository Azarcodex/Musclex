import { useQuery } from "@tanstack/react-query";
import {
  getcategory,
  getcategoryForVendors,
} from "../../services/vendor/category";

export const useGetCategory = () => {
  return useQuery({
    queryKey: ["category"],
    queryFn: getcategory,
  });
};
//vendor side

export const useGetVendorCategory = () => {
  return useQuery({
    queryKey: ["vendorcategory"],
    queryFn: getcategoryForVendors,
  });
};
