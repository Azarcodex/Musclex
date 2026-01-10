import { useMutation } from "@tanstack/react-query"
import { addWishList } from "../../services/user/wishlist"

export const useAddWishList=()=>
{
    return useMutation({
        mutationFn:addWishList
    })
}