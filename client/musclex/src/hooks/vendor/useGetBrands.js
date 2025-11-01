import { useQuery } from "@tanstack/react-query"
import { getBrands } from "../../services/vendor/brand"

export const useGetBrands=()=>
{
    return useQuery({
        queryKey:["brands"],
        queryFn:getBrands
    })
}