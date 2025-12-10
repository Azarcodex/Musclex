import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  changePassword,
  removeProfileImageService,
  updateuserName,
  uploadImage,
  userData,
} from "../../services/user/UserDetails";

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

//edit password
export const useChangePassword = () => {
  return useMutation({
    mutationFn: changePassword,
  });
};

//change image
export const useUploadImage = () => {
  return useMutation({
    mutationFn: uploadImage,
  });
};

export const useRemoveProfileImage = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: removeProfileImageService,
    onSuccess: () => {
      // refresh user profile data
      queryClient.invalidateQueries(["userDetails"]);
    },
  });
};
