import { useMutation } from "@tanstack/react-query"
import { postBrand } from "../../services/vendor/brand"
export const useAddBrands=()=>
{
    return useMutation({
        mutationFn:postBrand
    })
}