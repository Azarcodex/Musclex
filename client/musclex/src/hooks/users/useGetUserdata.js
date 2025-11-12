import { useMutation, useQuery } from "@tanstack/react-query";
import { updateuserName, userData } from "../../services/user/UserDetails";

export const useGetUserdata = () => {
  return useQuery({
    queryKey: ["userDetails"],
    queryFn: userData,
  });
};

//edit name
export const useEditUsername = () => {
  return useMutation({
    mutationFn: updateuserName,
  });
};
