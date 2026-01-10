import { fetchDashboardAnalytics } from "../../services/admin/dashbaord";
import { useQuery } from "@tanstack/react-query";
export const useDashboardAnalytics = () => {
  return useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardAnalytics,
    staleTime: 1000 * 60 * 2,
  });
};
