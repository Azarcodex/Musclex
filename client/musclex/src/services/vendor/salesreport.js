import api from "../../api/axios";

export const getSalesReport = async ({ page, filter }) => {
  console.log(page);
  const response = await api.post(
    `/api/vendor/sales/report?page=${page}&limit=3`,
    { filter }
  );
  return response.data;
};
