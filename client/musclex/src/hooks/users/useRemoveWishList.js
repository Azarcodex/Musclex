import { useMutation } from "@tanstack/react-query"
import { removeWishList } from "../../services/user/wishlist"

export const useRemoveWishList=()=>
{
    return useMutation({
        mutationFn:removeWishList
    })
}