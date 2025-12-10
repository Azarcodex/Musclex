import express from "express";
import { loginUser, registerUser } from "../controllers/user/authController.js";
import { otpController } from "../controllers/user/otpController.js";
import { resendOtp } from "../controllers/user/resendOTP.js";
import { forgetPassword } from "../controllers/user/forgetPassword.js";
import { forgetOtpController } from "../controllers/user/forgetOtpController.js";
import { getProducts } from "../controllers/user/products/getProducts.js";
// import { getBrands } from "../controllers/vendor/BrandController.js";
import { productListings } from "../controllers/user/products/productListings.js.js";
import {
  AddWishList,
  getWishList,
  removeWishList,
} from "../controllers/user/products/Wishlist.js";
import { AuthUser, protectedUser } from "../middlewares/users/authUser.js";
import {
  changePassword,
  getUserDetails,
  UpdateName,
} from "../controllers/user/Userdetails.js";
import { upload, uploadProfileImage } from "../utils/multerConfig.js";
import {
  addAddress,
  DefaultAddress,
  deleteAddress,
  getAddresses,
  updateAddress,
} from "../controllers/user/addressController.js";
import {
  AddCart,
  AddCartFromWishList,
  getCart,
  QuantityChange,
  removeFromCart,
  validatCart,
} from "../controllers/user/CartController.js";
import { getCheckoutData } from "../controllers/user/checkout.js";
import {
  cancelOrder,
  cancelProductOrder,
  getOrderList,
  OrderController,
  orderSummary,
  OrderTrack,
  returnOrderItem,
} from "../controllers/user/OrderController.js";
import { SearchData } from "../controllers/user/searchController.js";
import { FeaturedProducts } from "../controllers/vendor/addProducts.js";
import {
  ImageController,
  removeImage,
} from "../controllers/user/profileImageController.js";
import { fetchBrandUser } from "../controllers/vendor/BrandController.js";
import { getSingleOrder } from "../controllers/user/invoice.js";
import {
  applyCoupon,
  getAvailableCoupons,
} from "../controllers/user/couponController.js";
import { walletDashboard } from "../controllers/user/wallet.js";
const router = express.Router();

router.post("/register", registerUser);
router.post("/verify", otpController); //otp
router.post("/resend", resendOtp); //resend otp
router.post("/forget", forgetPassword); //forget password
router.post("/forgetCheck", forgetOtpController);
//login
router.post("/login", loginUser);
//products
router.get("/products", getProducts);
router.get("/products/featured", FeaturedProducts);
//categories
// router.get("/categories", getCategories);
//brands
router.get("/brand", fetchBrandUser);
//wishlist
router.get("/wishList", protectedUser, getWishList);
router.post("/wishList", protectedUser, AuthUser, AddWishList);
router.delete("/wishList/:id", protectedUser, removeWishList);
//product listings
router.get("/product/:productId", productListings);
//UserPage
router.get("/userdetail", protectedUser, getUserDetails);
router.patch("/userEdit", UpdateName);
router.put(
  "/profile/image",
  protectedUser,
  uploadProfileImage.single("avatar"),
  ImageController
);
router.delete("/profile/image", protectedUser, removeImage);
//password change
router.patch("/changePassword", protectedUser, changePassword);
//address
router.post("/address", protectedUser, addAddress); // POST /api/addresses
router.get("/address", protectedUser, getAddresses);
router.patch("/address/:id", protectedUser, updateAddress);
router.delete("/address/:id", protectedUser, deleteAddress);
router.patch("/address/default/:id", protectedUser, DefaultAddress);
//cartHandling
router.post("/addtocart", protectedUser, AuthUser, AddCart);
router.post(
  "/wishList/addtocart",
  protectedUser,
  AuthUser,
  AddCartFromWishList
);
router.get("/getcart", protectedUser, getCart);
router.get("/cart/validate", protectedUser, validatCart);
router.delete("/cart/:id", protectedUser, removeFromCart);
router.patch("/quantity/:id", protectedUser, QuantityChange);
//checkout
router.get("/checkout", protectedUser, AuthUser, getCheckoutData);
//order controller
router.post("/order", protectedUser, AuthUser, OrderController);
router.get("/order/summary/:id", protectedUser, orderSummary);
router.get("/orderList", protectedUser, getOrderList);
router.get("/orderList/:id", protectedUser, OrderTrack);
router.patch("/order/cancel/:id", protectedUser, cancelOrder);
//return order
router.patch("/order/return/:orderId/:itemId", protectedUser, returnOrderItem);
//individual product cancel
router.patch(
  "/order/cancel/:orderId/:item_id",
  protectedUser,
  cancelProductOrder
);
//home search
router.get("/search", SearchData);
//invoice

// router.get("/:orderId/invoice", getInvoice);
router.post("/coupon/apply", protectedUser, applyCoupon);
//coupons
router.get("/coupons", protectedUser, getAvailableCoupons);
//wallets
router.get("/wallet", protectedUser, walletDashboard);

//order invoice
router.get("/orders/:orderId", protectedUser, getSingleOrder);

export default router;
