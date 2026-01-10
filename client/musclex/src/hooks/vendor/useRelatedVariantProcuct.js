import { useQuery } from "@tanstack/react-query"
import { productRelatedVariants } from "../../services/vendor/Variant"

export const useRelatedVariantProduct=(id)=>
{
    return useQuery({
        queryKey:["related"],
        queryFn:()=>productRelatedVariants(id)
    })
}