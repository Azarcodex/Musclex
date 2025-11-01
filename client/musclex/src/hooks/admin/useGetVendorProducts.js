import { useQuery } from "@tanstack/react-query"
import { vendorProducts } from "../../services/admin/adminService"

export const useGetVendorProducts=()=>
{
    return useQuery({
        queryKey:["vendorProducts"],
        queryFn:vendorProducts
    })
}