import { useMutation } from "@tanstack/react-query"
import { controlCategory } from "../../services/vendor/category"

export const useControlCategory=()=>
{
    return useMutation({
        mutationFn:controlCategory
    })
}