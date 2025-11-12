import { useQuery } from "@tanstack/react-query"
import { vendorProducts } from "../../services/admin/adminService"

export const useGetVendorProducts=(page,limit,debounce)=>
{
    return useQuery({
        queryKey:["vendorProducts",page,limit,debounce],
        queryFn:()=>vendorProducts({page,limit,debounce})
    })
}