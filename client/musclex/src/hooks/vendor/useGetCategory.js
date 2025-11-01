import { useQuery } from "@tanstack/react-query"
import { getcategory } from "../../services/vendor/category"

export const useGetCategory=()=>
{
    return useQuery({
        queryKey:["category"],
        queryFn:getcategory
    })
}