import api from "../../api/axios";

export const getSalesReport = async ({ page }) => {
  console.log(page);
  const response = await api.get(
    `/api/vendor/sales/report?page=${page}&limit=3`
  );
  return response.data;
};
