import api from "../../api/axios";

//fetch Users with pagination and search
export const fetchUsers = async ({ page, search }) => {
  const response = await api.get(
    `/api/admin/getUsers?page=${page}&limit=10&search=${search}`
  );
  return response.data;
};
//verify Users
export const VerifyUsers = async (userId) => {
  const response = await api.put(`/api/admin/${userId}/verify`);
  return response.data;
};
//fetch vendors
export const fetchVendors = async ({ page, search, statusFilter }) => {
  const response = await api.get(
    `/api/admin/getVendors?page=${page}&limit=4&search=${search}&status=${statusFilter}`
  );
  return response.data;
};
//status control Vendors
export const UpdateStatusVendors = async ({ vendorId, status }) => {
  const response = await api.patch(`/api/admin/${vendorId}/status`, { status });
  return response.data;
};
//product permission controller
export const ProductPermission = async ({ vendorId }) => {
  const response = await api.patch(`/api/admin/${vendorId}/allow`);
  return response.data;
};

//fetch vendor products
export const vendorProducts = async ({ page, limit, debounce }) => {
  const response = await api.get(
    `/api/admin/vendor/products?page=${page}&limit=${limit}&search=${debounce}`
  );
  return response.data;
};

//fetch own vendor products
export const vendorOwnProducts = async ({ id, page, debounce }) => {
  const response = await api.get(
    `/api/admin/vendor/products/${id}?page=${page}&query=${debounce}`
  );
  return response.data;
};
//category controller
export const categoryController = async ({ id }) => {
  const response = await api.post(`/api/admin/category/view/${id}`);
  return response.data;
};

export const getCategoryAdmin = async () => {
  const response = await api.get(`/api/admin/category/all`);
  return response.data;
};
