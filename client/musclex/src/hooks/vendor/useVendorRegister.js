import { useMutation } from "@tanstack/react-query"
import { vendorRegistration } from "../../services/vendorAuthService"

export const useVendorRegister=()=>
{
    return useMutation({
        mutationFn:vendorRegistration
    })
}