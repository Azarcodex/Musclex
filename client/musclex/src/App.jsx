import React from "react";
import { Route, Routes } from "react-router-dom";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";
import AdminRoute from "./components/admin/AdminRoute";
import Register from "./pages/user/Register";
import VerifyOTP from "./pages/user/VerifyOTP";
import LoginUser from "./pages/user/LoginUser";
import Demo from "./pages/user/Demo";
import Forget from "./pages/user/Forget";
import RegisterVendor from "./pages/vendor/Register";
import LoginVendor from "./pages/vendor/LoginVendor";
import ForgetPassword from "./pages/user/ForgetPassword";
import ResetPassword from "./pages/user/ResetPassword";
import VendorDasboard from "./pages/vendor/VendorDasboard";
import Panel from "./components/admin/Panel";
import Users from "./pages/admin/Users";
import Vendors from "./pages/admin/Vendors";
import Home from "./pages/user/Home";
import Products from "./pages/user/Products";
import ProductVendor from "./pages/admin/ProductVendor";
import ProductsTable from "./pages/vendor/VendorProduct";
import AddProductForm from "./pages/vendor/ProductForm";
import AddCategoryForm from "./pages/vendor/CategoryForm";
import AddBrandForm from "./pages/vendor/BrandForm";
import VariantForm from "./pages/vendor/VariantForm";
import CategoryList from "./pages/vendor/CategoryList";
import BrandList from "./pages/vendor/BrandList";
import VariantList from "./pages/vendor/VariantList";
import OwnProducts from "./pages/admin/OwnProducts";
const App = () => {
  return (
    <>
      <Routes>
        //admin side// //components//
        <Route path="/admin/navbar" element={<Panel />} />
        //--------------//
        <Route path="/admin/login" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        >
          <Route path="users/list" element={<Users />} />
          <Route path="vendors/list" element={<Vendors />} />
          <Route path="vendors/list/products" element={<ProductVendor />} />
          <Route path="vendors/list/products/:id" element={<OwnProducts />} />
          <Route path="category/add" element={<AddCategoryForm />} />
          <Route path="category/list" element={<CategoryList />} />
        </Route>
        {/* <Route
          path="*"
          element={
            <AdminRoute>
              <Dashboard />
            </AdminRoute>
          }
        /> */}
        //user side//
        <Route path="/" element={<Home />} />
        <Route path="/user/register" element={<Register />} />
        <Route path="/user/login" element={<LoginUser />} />
        <Route path="/user/verify" element={<VerifyOTP />} />
        <Route path="/user/forget" element={<Forget />} />
        <Route path="/user/verifyforget" element={<ForgetPassword />} />
        <Route path="/user/demo" element={<Demo />} />
        <Route path="/user/reset" element={<ResetPassword />} />
        <Route path="/user/products" element={<Products />} />
        //vendor side//
        <Route path="/vendor/register" element={<RegisterVendor />} />
        <Route path="/vendor/login" element={<LoginVendor />} />
        <Route path="/vendor/dashboard" element={<VendorDasboard />}>
          <Route path="products/list" element={<ProductsTable />} />
          <Route path="products/add" element={<AddProductForm />} />
          <Route path="brand/list" element={<BrandList />} />
          <Route path="brand/add" element={<AddBrandForm />} />
          <Route path="variant/add/:productId" element={<VariantForm />} />
          <Route path="variant/:productId" element={<VariantList />} />
        </Route>
      </Routes>
    </>
  );
};

export default App;
