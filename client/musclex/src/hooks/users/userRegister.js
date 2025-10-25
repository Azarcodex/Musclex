import { useMutation } from "@tanstack/react-query"
import { Regisration } from "../../services/userAuthService.js"

export const useRegister=()=>
{
    return useMutation({
        mutationFn:Regisration
    })
}