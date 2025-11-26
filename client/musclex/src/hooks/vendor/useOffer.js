import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  createProductOffer,
  getProductOffers,
} from "../../services/vendor/offer";
import api from "../../api/axios";

export const useCreateProductOffer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createProductOffer,
    onSuccess: (data) => {
      toast.success(data.message || "Offer created successfully!");
      queryClient.invalidateQueries(["productOffers"]);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || "Failed to create offer");
    },
  });
};
export const useGetProductOffers = () => {
  return useQuery({
    queryKey: ["productOffers"],
    queryFn: getProductOffers,
    staleTime: 1000 * 60 * 2, // 2 min
  });
};

export const useGetAllVendorProducts = () => {
  return useQuery({
    queryKey: ["vendor-all-products"],
    queryFn: async () => {
      const res = await api.get("/api/vendor/all-products");
      console.log(res.data)
      return res.data;
    },
  });
};
