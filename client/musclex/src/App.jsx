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
import AddBrandForm from "./pages/vendor/BrandForm";
import VariantForm from "./pages/vendor/VariantForm";
import BrandList from "./pages/vendor/BrandList";
import VariantList from "./pages/vendor/VariantList";
import OwnProducts from "./pages/admin/OwnProducts";
import Category from "./pages/admin/Category";
import EditProduct from "./pages/vendor/EditProduct";
import VendorRoute from "./components/vendor/vendorRoute";
import ProductList from "./pages/user/ProductList";
import WishList from "./pages/user/WishList";
import EditVariant from "./pages/vendor/EditVariant";
import Profile from "./pages/user/UserPage/Profile";
import UserProfile from "./pages/user/UserPage/UserProfile";
import AddressesPage from "./pages/user/UserPage/Address";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import OrderSuccessPage from "./pages/user/OrderSuccessPage";
import VendorOrders from "./pages/vendor/Orders";
import UserOrdersPage from "./pages/user/UserOrders";
import UserOrderTrack from "./pages/user/UserOrderTrack";
import ChangePassword from "./pages/user/ChangePassword";
import SalesReport from "./pages/vendor/SalesReport";
import AdminCategoryOffers from "./pages/admin/AdminCategoryOffers";
import ProductOffers from "./pages/vendor/Offers";
import CouponManagement from "./pages/admin/Coupon";
import ProtectedRoute from "./components/user/Protected";
import Wallet from "./pages/user/UserPage/Wallet";
import VendorWalletPage from "./pages/vendor/Wallet";
import VendorAuthRoute from "./components/vendor/VendorAuthRoute";
import Referral from "./pages/user/UserPage/Referral";
import CouponUsers from "./pages/admin/CouponUsers";
import OrderFailed from "./pages/user/OrderFailure";
import InvoicePage from "./pages/user/invoice";
import DashboardAnalytics from "./pages/admin/adminAnalytics";
import BannerDashboard from "./pages/admin/Banner";
import VendorDashboardAnalysis from "./pages/vendor/DashboardAnalysis";
import NotFound from "./pages/user/404";
import SalesReportPrintPage from "./pages/vendor/SalesReportPrintPage";
import { useSelector } from "react-redux";
import ServerDown from "./components/common/Serverdown";
const App = () => {
  const serverDown = useSelector((state) => state.apiStatus.serverDown);

  if (serverDown) {
    return <ServerDown />;
  }
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
          <Route path="category" element={<Category />} />
          <Route path="addOffer" element={<AdminCategoryOffers />} />
          <Route path="coupon" element={<CouponManagement />} />
          <Route path="couponUsers" element={<CouponUsers />} />
          <Route path="analytics" element={<DashboardAnalytics />} />
          <Route path="banner" element={<BannerDashboard />} />
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
        <Route path="/user/products/:id" element={<ProductList />} />
        <Route path="/user/wishlist" element={<WishList />} />
        <Route path="/user/cart" element={<CartPage />} />
        <Route
          path="/user/checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route path="/user/ordersuccess/:id" element={<OrderSuccessPage />} />
        <Route
          path="/user/orderfailed/:tempOrderId"
          element={<OrderFailed />}
        />
        <Route
          path="/user/userdetails"
          element={
            <ProtectedRoute>
              <UserProfile />
            </ProtectedRoute>
          }
        >
          <Route path="profile" element={<Profile />} />
          <Route path="address" element={<AddressesPage />} />
          <Route path="wallet" element={<Wallet />} />
          <Route path="referral" element={<Referral />} />
        </Route>
        <Route
          path="/user/changePassword"
          element={
            <ProtectedRoute>
              <ChangePassword />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/orders"
          element={
            <ProtectedRoute>
              <UserOrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/user/orders/track/:orderId"
          element={<UserOrderTrack />}
        />
        <Route path="/user/orders/invoice/:orderId" element={<InvoicePage />} />
        //invoice //🏪🏪vendor side//
        <Route
          path="/vendor/register"
          element={
            <VendorAuthRoute>
              <RegisterVendor />
            </VendorAuthRoute>
          }
        />
        <Route path="/vendor/login" element={<LoginVendor />} />
        <Route
          path="/vendor/sales-report/print"
          element={<SalesReportPrintPage />}
        />
        <Route
          path="/vendor/dashboard"
          element={
            <VendorRoute>
              <VendorDasboard />
            </VendorRoute>
          }
        >
          <Route path="analysis" element={<VendorDashboardAnalysis />} />
          <Route path="products/list" element={<ProductsTable />} />
          <Route path="products/offers" element={<ProductOffers />} />
          <Route path="products/add" element={<AddProductForm />} />
          <Route path="products/edit/:productId" element={<EditProduct />} />
          <Route path="brand/list" element={<BrandList />} />
          <Route path="brand/add" element={<AddBrandForm />} />
          <Route path="variant/add/:productId" element={<VariantForm />} />
          <Route path="variant/:productId" element={<VariantList />} />
          <Route path="wallet" element={<VendorWalletPage />} />
          <Route
            path="variant/:productId/edit/:variantId"
            element={<EditVariant />}
          />
          <Route path="orders/list" element={<VendorOrders />} />
          <Route path="sales/report" element={<SalesReport />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </>
  );
};

export default App;
