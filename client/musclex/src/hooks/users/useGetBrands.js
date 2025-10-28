import { useQuery } from "@tanstack/react-query"
import { fetchBrand } from "../../services/user/BrandFetch"

export const useGetBrands=()=>
{
    return useQuery({
        queryKey:["Brand"],
        queryFn:fetchBrand
    })
}