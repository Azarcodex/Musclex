import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createOffer,
  getOffers,
  updateOffers,
  visibilityOffers,
} from "../../services/admin/offer";

export const useCreateOffer = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createOffer,
    onSuccess: () => {
      queryClient.invalidateQueries(["offers"]);
    },
  });
};

export const usegetOffers = () => {
  return useQuery({
    queryKey: ["offers"],
    queryFn: getOffers,
  });
};

//edit offers
export const useEditOffers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateOffers,
    onSuccess: () => {
      queryClient.invalidateQueries(["offers"]);
    },
  });
};

//visibility
export const useOfferVisibility = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: visibilityOffers,
    onSuccess: () => {
      queryClient.invalidateQueries(["offers"]);
    },
  });
};
