import { useMutation } from "@tanstack/react-query"
import { deleteCategory } from "../../services/vendor/category"

export const useDeleteCategory=()=>
{
    return useMutation({
        mutationFn:deleteCategory
    })
}