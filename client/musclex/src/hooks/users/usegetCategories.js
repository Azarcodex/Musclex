import { useQuery } from "@tanstack/react-query"
import { CategoryFetch } from "../../services/user/CategoryFetch"

export const usegetCategories=()=>
{
    return useQuery({
        queryKey:["category"],
        queryFn:CategoryFetch
    })
}