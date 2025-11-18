import { useMutation, useQuery } from "@tanstack/react-query";
import {
  changePassword,
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
