import api from "../../api/axios";

export const fetchDashboardAnalytics = async () => {
  const res = await api.get("/api/admin/dashboard/analytics");
  return res.data;
};
