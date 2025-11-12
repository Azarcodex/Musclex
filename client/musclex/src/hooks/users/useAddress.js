import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addAddress,
  defaultAddress,
  DeleteAddress,
  EditAddress,
  fetchAddresses,
} from "../../services/user/Address";

//  Fetch all addresses
export const useAddresses = () =>
  useQuery({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
    // staleTime: 1000 * 60 * 5, // 5 minutes
  });

//  Add new address
export const useAddAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
    },
  });
};

//edit address
export const useEditAddress = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: EditAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
    },
  });
};

//delete
export const useDeleteAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: DeleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
    },
  });
};
//default
export const useDefaultAddress = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: defaultAddress,
    onSuccess: () => {
      queryClient.invalidateQueries(["addresses"]);
    },
  });
};
